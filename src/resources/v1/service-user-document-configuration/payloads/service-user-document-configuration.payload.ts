export interface ICreateServiceUserDocConfigPayload {
  user_id?: string;
  service_id: string;
  document_requirement_id: string;
  is_mandatory?: boolean;
  current_status?: string;
}

export interface IUpdateServiceUserDocConfigPayload {
  is_mandatory?: boolean;
  current_status?: string;
  is_active?: boolean;
}

export interface IUploadServiceUserDocPayload {
  document_id: string;
}

export interface IApproveServiceUserDocPayload {
  validation_notes?: string;
}

export interface IRejectServiceUserDocPayload {
  reason: string;
}
