import { ActionTypes, ErrorTypes } from "../helpers/response-builder";

export interface ErrorDetails {
  message: string;
  data?: any;
  filler?: any;
}

export interface ActionRequiredBase {
  type: ActionTypes;
  message: string;
  force_action?: boolean;
}
export interface ConfirmationAction extends ActionRequiredBase {
  type: ActionTypes.CONFIRMATION;
  confirmationId: string;
  options?: {
    confirmLabel?: string;
    cancelLabel?: string;
  };
}

export interface DependencyWarningAction {
  type: ErrorTypes.CONFLICT;
  dependencies: {
    id: string;
    name: string;
  }[];
}
export interface ApiResponse<T = any> {
  data?: T;

  error?: {
    code: ErrorTypes;
    details?: any;
    filler?: any;
  };

  actionRequired?: {
    type: ActionTypes;
    message?: string;
    force_action?: boolean;
    meta?: any;
  };

  meta: {
    requestId?: string;
    timestamp?: string;
  };
}
