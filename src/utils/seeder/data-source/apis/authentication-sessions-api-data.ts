import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/authentication-session-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const authenticationSessionsApiData: IAPI[] = [
  // create session
  {
    activity_type: activityTypes.Create,
    module: moduleTypes.AuthenticationSession,
    activity_name: "Create",
    activity_code: "create",
    activity_method: apiMethods.POST,
    url: "/api/v1/masters/auth-sessions",
    status: true,
    form_params: [],
    search_params: [],
    access_params: {
      admin_access: { type: AccessType.ALL, keys: [] },
    },
    control_params: [],
    payload_params: [],
    admin_access: true,
    user_access: false,
    employee_access: false,
    required_authentication: true,
  },

  // list sessions
  {
    activity_type: activityTypes.List,
    module: moduleTypes.AuthenticationSession,
    activity_name: activityName.List,
    activity_code: activityCode.List,
    activity_method: apiMethods.GET,
    url: "/api/v1/masters/auth-sessions",
    status: true,
    form_params: [],
    search_params: [
      ...defaultSearchParams,
    ],
    access_params: {
      admin_access: { type: AccessType.ALL, keys: [] },
    },
    control_params: [],
    payload_params: [],
    admin_access: true,
    user_access: false,
    employee_access: false,
    required_authentication: true,
  },
];

export default authenticationSessionsApiData;
