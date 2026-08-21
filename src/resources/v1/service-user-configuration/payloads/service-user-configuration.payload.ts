export interface IBulkStoreServiceUserConfigPayload {
  user_id?: string;
  service_ids: string[];
}

export interface ICreateSingleServiceUserConfigPayload {
  user_id?: string;
  service_id: string;
  eligibility_status?: "pending" | "verified" | "uploaded" | "approved" | "rejected" | "hold";
}

export interface IUpdateServiceUserConfigPayload {
  eligibility_status?: "pending" | "verified" | "uploaded" | "approved" | "rejected" | "hold";
  is_active?: boolean;
}
