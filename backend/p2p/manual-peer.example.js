import { ManualPeerSession } from "./manual-peer.js";

// Host: copy offerCode to the invited learner, then paste their answerCode.
export async function hostManualSession(onEvent) {
  const session = new ManualPeerSession();
  for (const type of ["state", "peer-ready", "text", "correction", "voice", "protocol-error"]) {
    session.addEventListener(type, (event) => onEvent(type, event.detail));
  }
  const { offerCode, verificationCode } = await session.createOffer();
  return {
    session,
    offerCode,
    verificationCode,
    acceptAnswer: (answerCode) => session.acceptAnswer(answerCode),
  };
}

// Guest: paste the host's offerCode, then copy answerCode back to the host.
export async function joinManualSession(offerCode, onEvent) {
  const result = await ManualPeerSession.acceptOffer(offerCode);
  for (const type of ["state", "peer-ready", "text", "correction", "voice", "protocol-error"]) {
    result.session.addEventListener(type, (event) => onEvent(type, event.detail));
  }
  return result;
}
