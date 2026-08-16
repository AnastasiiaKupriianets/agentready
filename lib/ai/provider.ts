export interface AiControlContext {
  /** The visible/accessible text of the control being evaluated, e.g. "Continue". */
  controlText: string;
  /** Real nearest-preceding-heading in document order, or null. Not fabricated proximity. */
  nearestHeading: string | null;
  pageTitle: string | null;
}

export interface AiControlInsight {
  controlText: string;
  nearestHeading: string | null;
  /** The model's own judgment of whether this control is ambiguous in context — may disagree with the deterministic flag. */
  isAmbiguous: boolean;
  explanation: string;
  recommendation: string;
}

export interface AiProvider {
  /** Returns null (not a thrown error) when the call fails, times out, or the response can't be validated — callers treat null as "skip". */
  explainControl(context: AiControlContext): Promise<AiControlInsight | null>;
}
