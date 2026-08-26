import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/region-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const regionsApiData = (): IAPI[] => [
    // create region
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.Regions,
        activity_name: activityName.createRegion,
        activity_code: activityCode.createRegion,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/regions",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [
            {
                key: "name",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "code",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "country_id",
                value: "string",
                type: datatypes.Object,
                required: true,
                parent: false,
                parent_key: "",
            },
        ],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // list region
    {
        activity_type: activityTypes.List,
        module: moduleTypes.Regions,
        activity_name: activityName.listRegion,
        activity_code: activityCode.listRegion,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/regions",
        status: true,
        form_params: [],
        search_params: [
            ...defaultSearchParams,
            {
                title: "name_like",
                value: "name",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
                is_required: false,
            },
            {
                title: "code_like",
                value: "code",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
                is_required: false,
            },
            {
                title: "country_id",
                value: "country_id._id",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
                is_required: false,
            },
            {
                title: "country_name_like",
                value: "country_id.name",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
                is_required: false,
            },
            {
                title: "country_status_id",
                value: "country_id.status_id._id",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Exact,
                is_active: true,
                is_required: false,
            },
            {
                title: "country_status_title_like",
                value: "country_id.status_id.title",
                allowed_values: [],
                datatype: datatypes.String,
                search_type: searchTypes.Partial,
                is_active: true,
                is_required: false,
            },
        ],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },

    // update region
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.Regions,
        activity_name: activityName.updateRegion,
        activity_code: activityCode.updateRegion,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/regions/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [
            {
                key: "name",
                value: "string",
                type: datatypes.String,
                required: true,
                parent: false,
                parent_key: "",
            },
            {
                key: "country_id",
                value: "string",
                type: datatypes.String,
                required: false,
                parent: false,
                parent_key: "",
            },
        ],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },

    // delete region
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.Regions,
        activity_name: activityName.deleteRegion,
        activity_code: activityCode.deleteRegion,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/regions/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    // activate region
    {
        activity_type: activityTypes.Activate,
        module: moduleTypes.Regions,
        activity_name: activityName.activateRegion,
        activity_code: activityCode.activateRegion,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/regions/:id/activate",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    // deactivate region
    {
        activity_type: activityTypes.Deactivate,
        module: moduleTypes.Regions,
        activity_name: activityName.deactivateRegion,
        activity_code: activityCode.deactivateRegion,
        activity_method: apiMethods.PATCH,
        url: "/api/v1/masters/regions/:id/deactivate",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
    // show region
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.Regions,
        activity_name: activityName.showRegion,
        activity_code: activityCode.showRegion,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/regions/:id",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin"), getRoleId("user"), getRoleId("employee")],
    },
    // log region
    {
        activity_type: activityTypes.Log,
        module: moduleTypes.Regions,
        activity_name: activityName.logRegion,
        activity_code: activityCode.logRegion,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/regions/log",
        status: true,
        form_params: [],
        search_params: [],
        access_params: {
        },

        control_params: [],
        payload_params: [],
        required_authentication: true,
      access_roles: [getRoleId("super_admin"), getRoleId("admin")],
    },
];

export default regionsApiData;
