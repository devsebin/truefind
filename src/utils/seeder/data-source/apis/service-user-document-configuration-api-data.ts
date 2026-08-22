import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import {
  activityCode,
  activityName,
} from "../../activities/service-user-document-configuration-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { searchTypes } from "../../../../utils/definitions/constants/search-types";

const serviceUserDocumentConfigurationApiData = (): IAPI[] => [
  // List
  {
    activity_type: activityTypes.List,
    module: moduleTypes.ServiceUserDocumentConfigurations,
    activity_name: activityName.listServiceUserDocConfigs,
    activity_code: activityCode.listServiceUserDocConfigs,
    activity_method: apiMethods.GET,
    url: "/api/v1/service-user-document-configurations",
    status: true,
    form_params: [],
    search_params: [
      ...defaultSearchParams,
      {
        title: "user_id",
        value: "user_id",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Exact,
        is_active: true,
        admin_access: true,
        user_access: true,
        employee_access: true,
      },
      {
        title: "task_id",
        value: "task_id",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Exact,
        is_active: true,
        admin_access: true,
        user_access: true,
        employee_access: true,
      },
      {
        title: "document_requirement_id",
        value: "document_requirement_id",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Exact,
        is_active: true,
        admin_access: true,
        user_access: true,
        employee_access: true,
      },
      {
        title: "current_status",
        value: "current_status",
        allowed_values: [],
        datatype: datatypes.String,
        search_type: searchTypes.Exact,
        is_active: true,
        admin_access: true,
        user_access: true,
        employee_access: true,
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

  // Show
  {
    activity_type: activityTypes.Show,
    module: moduleTypes.ServiceUserDocumentConfigurations,
    activity_name: activityName.showServiceUserDocConfig,
    activity_code: activityCode.showServiceUserDocConfig,
    activity_method: apiMethods.GET,
    url: "/api/v1/service-user-document-configurations/:id",
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

  // Enable
  {
    activity_type: activityTypes.Update,
    module: moduleTypes.ServiceUserDocumentConfigurations,
    activity_name: activityName.enableServiceUserDocConfig,
    activity_code: activityCode.enableServiceUserDocConfig,
    activity_method: apiMethods.PATCH,
    url: "/api/v1/service-user-document-configurations/:id/enable",
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

  // Disable
  {
    activity_type: activityTypes.Update,
    module: moduleTypes.ServiceUserDocumentConfigurations,
    activity_name: activityName.disableServiceUserDocConfig,
    activity_code: activityCode.disableServiceUserDocConfig,
    activity_method: apiMethods.PATCH,
    url: "/api/v1/service-user-document-configurations/:id/disable",
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

  // Delete
  {
    activity_type: activityTypes.Delete,
    module: moduleTypes.ServiceUserDocumentConfigurations,
    activity_name: activityName.deleteServiceUserDocConfig,
    activity_code: activityCode.deleteServiceUserDocConfig,
    activity_method: apiMethods.DELETE,
    url: "/api/v1/service-user-document-configurations/:id",
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
];

export default serviceUserDocumentConfigurationApiData;
