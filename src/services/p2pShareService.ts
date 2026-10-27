/**
 * VentureFlow P2P Direct Browser-to-Browser Sharing Service (Mode B)
 * Real WebRTC RTCPeerConnection & RTCDataChannel implementation.
 * Zero intermediary cloud storage or servers.
 */

import { EncryptedExportFile } from './shareService';

export interface P2PSignalingMessage {
  type: 'offer' | 'answer';
  sdp: string;
  sessionId: string;
}

export type P2PConnectionState =
  | 'idle'
  | 'generating_offer'
  | 'waiting_for_peer'
  | 'connecting'
  | 'connected'
  | 'transfer_complete'
  | 'closed'
  | 'error';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class P2PShareSession {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  public sessionId: string;
  private onStateChange: (state: P2PConnectionState, detail?: string) => void;
  private onDataReceived: (pkg: EncryptedExportFile) => void;

  constructor(
    sessionId: string,
    onStateChange: (state: P2PConnectionState, detail?: string) => void,
    onDataReceived: (pkg: EncryptedExportFile) => void
  ) {
    this.sessionId = sessionId;
    this.onStateChange = onStateChange;
    this.onDataReceived = onDataReceived;

    // Optional local signaling for same-origin tabs
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(`vf_p2p_${sessionId}`);
      } catch {
        this.broadcastChannel = null;
      }
    }
  }

  /** Initiator: create WebRTC offer and package to send */
  async createSenderOffer(payloadToSend: EncryptedExportFile): Promise<string> {
    this.onStateChange('generating_offer', 'Génération de l\'offre de connexion WebRTC...');
    this.pc = new RTCPeerConnection(ICE_SERVERS);

    this.dataChannel = this.pc.createDataChannel('ventureflow-vault-share', {
      ordered: true,
    });

    this.setupDataChannel(this.dataChannel, payloadToSend);
    this.setupPeerConnectionEvents();

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Wait for ICE gathering to complete so the token is self-contained
    await this.waitForIceGatheringComplete();

    const localDesc = this.pc.localDescription;
    if (!localDesc) throw new Error('Impossible de générer la description locale WebRTC.');

    const tokenPayload: P2PSignalingMessage = {
      type: 'offer',
      sdp: localDesc.sdp,
      sessionId: this.sessionId,
    };

    const tokenBase64 = window.btoa(encodeURIComponent(JSON.stringify(tokenPayload)));
    this.onStateChange('waiting_for_peer', 'En attente de connexion du récepteur...');

    // If broadcast channel is open, broadcast to sibling tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'vf_offer', token: tokenBase64 });
      this.broadcastChannel.onmessage = async (evt) => {
        if (evt.data && evt.data.type === 'vf_answer' && evt.data.token) {
          await this.acceptReceiverAnswer(evt.data.token);
        }
      };
    }

    return tokenBase64;
  }

  /** Receiver: accept offer token, prepare to receive package, produce answer */
  async acceptSenderOffer(offerTokenBase64: string): Promise<string> {
    this.onStateChange('connecting', 'Négociation de la connexion WebRTC avec le pair...');

    let parsed: P2PSignalingMessage;
    try {
      const decoded = decodeURIComponent(window.atob(offerTokenBase64));
      parsed = JSON.parse(decoded);
    } catch {
      throw new Error('Token d\'invitation P2P invalide ou corrompu.');
    }

    if (parsed.type !== 'offer' || !parsed.sdp) {
      throw new Error('Le token fourni n\'est pas une offre de connexion valide.');
    }

    this.pc = new RTCPeerConnection(ICE_SERVERS);
    this.setupPeerConnectionEvents();

    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };

    await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: parsed.sdp }));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    await this.waitForIceGatheringComplete();

    const localDesc = this.pc.localDescription;
    if (!localDesc) throw new Error('Impossible de générer la réponse WebRTC.');

    const answerPayload: P2PSignalingMessage = {
      type: 'answer',
      sdp: localDesc.sdp,
      sessionId: this.sessionId,
    };

    const answerBase64 = window.btoa(encodeURIComponent(JSON.stringify(answerPayload)));

    // Broadcast if receiver is a sibling tab
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'vf_answer', token: answerBase64 });
    }

    return answerBase64;
  }

  /** Initiator: apply receiver answer to finalize P2P direct link */
  async acceptReceiverAnswer(answerTokenBase64: string): Promise<void> {
    if (!this.pc) throw new Error('Aucune session initiée.');

    let parsed: P2PSignalingMessage;
    try {
      const decoded = decodeURIComponent(window.atob(answerTokenBase64));
      parsed = JSON.parse(decoded);
    } catch {
      throw new Error('Token de réponse P2P invalide.');
    }

    if (parsed.type !== 'answer' || !parsed.sdp) {
      throw new Error('Le token fourni n\'est pas une réponse WebRTC valide.');
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: parsed.sdp }));
    this.onStateChange('connecting', 'Canal chiffré en cours d\'établissement...');
  }

  private setupDataChannel(channel: RTCDataChannel, payloadToSend?: EncryptedExportFile) {
    channel.onopen = () => {
      this.onStateChange('connected', 'Canal direct P2P chiffré établi avec succès.');
      if (payloadToSend) {
        // Send payload in JSON form over encrypted DataChannel
        channel.send(JSON.stringify(payloadToSend));
        this.onStateChange('transfer_complete', 'Dossier confidentiel transmis au destinataire.');
      }
    };

    channel.onmessage = (event) => {
      try {
        const received = JSON.parse(event.data) as EncryptedExportFile;
        if (received && received.format === 'VENTUREFLOW_ENCRYPTED_REPORT_V2') {
          this.onDataReceived(received);
          this.onStateChange('transfer_complete', 'Paquet de données chiffré reçu directement via WebRTC.');
        }
      } catch (err) {
        console.error('Erreur lecture données P2P:', err);
      }
    };

    channel.onclose = () => {
      this.onStateChange('closed', 'Canal P2P fermé.');
    };

    channel.onerror = (err) => {
      console.error('DataChannel error:', err);
      this.onStateChange('error', 'Erreur sur le canal de données direct.');
    };
  }

  private setupPeerConnectionEvents() {
    if (!this.pc) return;

    this.pc.onconnectionstatechange = () => {
      if (!this.pc) return;
      if (this.pc.connectionState === 'connected') {
        this.onStateChange('connected', 'Pair connecté.');
      } else if (this.pc.connectionState === 'disconnected' || this.pc.connectionState === 'failed') {
        this.onStateChange('error', 'Connexion P2P interrompue ou bloquée par le pare-feu.');
      } else if (this.pc.connectionState === 'closed') {
        this.onStateChange('closed', 'Session WebRTC terminée.');
      }
    };
  }

  private waitForIceGatheringComplete(): Promise<void> {
    const pc = this.pc;
    if (!pc) return Promise.resolve();
    if (pc.iceGatheringState === 'complete') return Promise.resolve();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(); // proceed anyway after 3s max
      }, 3000);

      const check = () => {
        if (!pc || pc.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          pc.removeEventListener('icegatheringstatechange', check);
          resolve();
        }
      };

      pc.addEventListener('icegatheringstatechange', check);
    });
  }

  /** Terminate session and release network resources */
  close() {
    if (this.dataChannel) {
      try {
        this.dataChannel.close();
      } catch {}
      this.dataChannel = null;
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {}
      this.broadcastChannel = null;
    }
    this.onStateChange('closed', 'Session terminée.');
  }
}
