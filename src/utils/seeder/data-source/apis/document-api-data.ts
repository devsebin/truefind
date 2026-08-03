import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/document-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";

const documentApiData: IAPI[] = [
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
            admin_access: { type: AccessType.ALL, keys: [] },
        },

        control_params: [],
        payload_params: [],
        admin_access: true,
        user_access: false,
        employee_access: false,
        required_authentication: true,
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
            admin_access: { type: AccessType.ALL, keys: [] },
        },

        control_params: [],
        payload_params: [],
        admin_access: true,
        user_access: false,
        employee_access: false,
        required_authentication: true,
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

export default documentApiData;
