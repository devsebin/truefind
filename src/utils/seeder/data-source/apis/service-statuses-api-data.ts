import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import {
  activityCode,
  activityName,
} from "../../activities/service-statuses-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const serviceStatusesApiData = (): IAPI[] => [
  // create service status
  {
    activity_type: activityTypes.Create,
    module: moduleTypes.ServiceStatuses,
    activity_name: activityName.createServiceStatuses,
    activity_code: activityCode.createServiceStatuses,
    activity_method: apiMethods.POST,
    url: "/api/v1/masters/service-statuses",
    status: true,
    form_params: [],
    search_params: [],
    access_params: {},
    control_params: [],
    payload_params: [
      {
        key: "title",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "label",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "color",
        value: "string",
        type: datatypes.String,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "is_default",
        value: "boolean",
        type: datatypes.Boolean,
        required: false,
        parent: false,
        parent_key: "",
      },
    ],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },

  // list service statuses
  {
    activity_type: activityTypes.List,
    module: moduleTypes.ServiceStatuses,
    activity_name: activityName.listServiceStatuses,
    activity_code: activityCode.listServiceStatuses,
    activity_method: apiMethods.GET,
    url: "/api/v1/masters/service-statuses",
    status: true,
    form_params: [],
    search_params: [
      ...defaultSearchParams,
      {
        title: "title_like",
        value: "title",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Partial,
        is_active: true,
      },
      {
        title: "label",
        value: "label",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Exact,
        is_active: true,
      },
    ],
    access_params: {},
    control_params: [],
    payload_params: [],
    required_authentication: true,
    access_roles: [
      getRoleId("super_admin"),
      getRoleId("admin"),
      getRoleId("user"),
      getRoleId("employee"),
    ],
  },

  // update service status
  {
    activity_type: activityTypes.Update,
    module: moduleTypes.ServiceStatuses,
    activity_name: activityName.updateServiceStatuses,
    activity_code: activityCode.updateServiceStatuses,
    activity_method: apiMethods.PUT,
    url: "/api/v1/masters/service-statuses/:id",
    status: true,
    form_params: [],
    search_params: [],
    access_params: {},
    control_params: [],
    payload_params: [
      {
        key: "title",
        value: "string",
        type: datatypes.String,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "label",
        value: "string",
        type: datatypes.String,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "color",
        value: "string",
        type: datatypes.String,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "is_default",
        value: "boolean",
        type: datatypes.Boolean,
        required: false,
        parent: false,
        parent_key: "",
      },
    ],
    required_authentication: true,
    access_roles: [
      getRoleId("super_admin"),
      getRoleId("admin"),
      getRoleId("user"),
      getRoleId("employee"),
    ],
  },

  // delete service status
  {
    activity_type: activityTypes.Delete,
    module: moduleTypes.ServiceStatuses,
    activity_name: activityName.deleteServiceStatuses,
    activity_code: activityCode.deleteServiceStatuses,
    activity_method: apiMethods.DELETE,
    url: "/api/v1/masters/service-statuses/:id",
    status: true,
    form_params: [],
    search_params: [
      {
        title: "force_action",
        value: "force_action",
        allowed_values: [],
        datatype: datatypes.Boolean,
        search_type: searchTypes.Exact,
        is_active: true,
      },
    ],
    access_params: {},
    control_params: [],
    payload_params: [],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },

  // activate service status
  {
    activity_type: activityTypes.Activate,
    module: moduleTypes.ServiceStatuses,
    activity_name: activityName.activateServiceStatuses,
    activity_code: activityCode.activateServiceStatuses,
    activity_method: apiMethods.PATCH,
    url: "/api/v1/masters/service-statuses/:id/enable",
    status: true,
    form_params: [],
    search_params: [],
    access_params: {},
    control_params: [],
    payload_params: [],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },

  // deactivate service status
  {
    activity_type: activityTypes.Deactivate,
    module: moduleTypes.ServiceStatuses,
    activity_name: activityName.deactivateServiceStatuses,
    activity_code: activityCode.deactivateServiceStatuses,
    activity_method: apiMethods.PATCH,
    url: "/api/v1/masters/service-statuses/:id/disable",
    status: true,
    form_params: [],
    search_params: [],
    access_params: {},
    control_params: [],
    payload_params: [],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },

  // show service status
  {
    activity_type: activityTypes.Show,
    module: moduleTypes.ServiceStatuses,
    activity_name: activityName.showServiceStatuses,
    activity_code: activityCode.showServiceStatuses,
    activity_method: apiMethods.GET,
    url: "/api/v1/masters/service-statuses/:id",
    status: true,
    form_params: [],
    search_params: [],
    access_params: {},
    control_params: [],
    payload_params: [],
    required_authentication: true,
    access_roles: [
      getRoleId("super_admin"),
      getRoleId("admin"),
      getRoleId("user"),
      getRoleId("employee"),
    ],
  },

  // log service status
  {
    activity_type: activityTypes.Log,
    module: moduleTypes.ServiceStatuses,
    activity_name: activityName.logServiceStatuses,
    activity_code: activityCode.logServiceStatuses,
    activity_method: apiMethods.GET,
    url: "/api/v1/masters/service-statuses/log",
    status: true,
    form_params: [],
    search_params: [],
    access_params: {},
    control_params: [],
    payload_params: [],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },
];

export default serviceStatusesApiData;
