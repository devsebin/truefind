import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/document-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";

const documentApiData = (): IAPI[] => [
    // create document
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Uploads,
        activity_name: activityName.createDocument,
        activity_code: activityCode.createDocument,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/documents",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // show document
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Uploads,
        activity_name: activityName.showDocument,
        activity_code: activityCode.showDocument,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/documents/:id",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // delete document
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Uploads,
        activity_name: activityName.deleteDocument,
        activity_code: activityCode.deleteDocument,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/documents/:id",
        status: true,
        form_params: [],
        search_params: [],

        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      admin_access: true,
      user_access: false,
      employee_access: false,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
];

export default documentApiData;
