import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import {
  activityCode,
  activityName,
} from "../../activities/service-information-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";
import { datatypes } from "../../../../utils/definitions/constants/data-types";
import { defaultSearchParams } from "../../../../utils/helpers/seeder.helper";

const serviceInformationApiData = (): IAPI[] => [
  // Create / Store
  {
    activity_type: activityTypes.Create,
    module: moduleTypes.ServiceInformations,
    activity_name: activityName.createServiceInformation,
    activity_code: activityCode.createServiceInformation,
    activity_method: apiMethods.POST,
    url: "/api/v1/masters/service-informations",
    status: true,
    form_params: [],
    search_params: [],
        access_params: {},
    control_params: [],
    payload_params: [
      {
        key: "service_id",
        value: "string",
        type: datatypes.Object,
        required: true,
        parent: false,
        parent_key: "",
      },
      {
        key: "how_it_works",
        value: "array",
        type: datatypes.Array,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "included_items",
        value: "array",
        type: datatypes.Array,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "insurance_coverage",
        value: "object",
        type: datatypes.Object,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "faqs",
        value: "array",
        type: datatypes.Array,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "disclaimers",
        value: "array",
        type: datatypes.Array,
        required: false,
        parent: false,
        parent_key: "",
      },
    ],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },

  // List
  {
    activity_type: activityTypes.List,
    module: moduleTypes.ServiceInformations,
    activity_name: activityName.listServiceInformations,
    activity_code: activityCode.listServiceInformations,
    activity_method: apiMethods.GET,
    url: "/api/v1/masters/service-informations",
    status: true,
    form_params: [],
    search_params: [...defaultSearchParams],
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
    module: moduleTypes.ServiceInformations,
    activity_name: activityName.showServiceInformation,
    activity_code: activityCode.showServiceInformation,
    activity_method: apiMethods.GET,
    url: "/api/v1/masters/service-informations/:id",
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

  // Update
  {
    activity_type: activityTypes.Update,
    module: moduleTypes.ServiceInformations,
    activity_name: activityName.updateServiceInformation,
    activity_code: activityCode.updateServiceInformation,
    activity_method: apiMethods.PUT,
    url: "/api/v1/masters/service-informations/:id",
    status: true,
    form_params: [],
    search_params: [],
        access_params: {},
    control_params: [],
    payload_params: [
      {
        key: "how_it_works",
        value: "array",
        type: datatypes.Array,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "included_items",
        value: "array",
        type: datatypes.Array,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "insurance_coverage",
        value: "object",
        type: datatypes.Object,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "faqs",
        value: "array",
        type: datatypes.Array,
        required: false,
        parent: false,
        parent_key: "",
      },
      {
        key: "disclaimers",
        value: "array",
        type: datatypes.Array,
        required: false,
        parent: false,
        parent_key: "",
      },
    ],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },

  // Delete
  {
    activity_type: activityTypes.Delete,
    module: moduleTypes.ServiceInformations,
    activity_name: activityName.deleteServiceInformation,
    activity_code: activityCode.deleteServiceInformation,
    activity_method: apiMethods.DELETE,
    url: "/api/v1/masters/service-informations/:id",
    status: true,
    form_params: [],
    search_params: [],
        access_params: {},
    control_params: [],
    payload_params: [],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },

  // Enable
  {
    activity_type: activityTypes.Update,
    module: moduleTypes.ServiceInformations,
    activity_name: activityName.enableServiceInformation,
    activity_code: activityCode.enableServiceInformation,
    activity_method: apiMethods.PATCH,
    url: "/api/v1/masters/service-informations/:id/enable",
    status: true,
    form_params: [],
    search_params: [],
        access_params: {},
    control_params: [],
    payload_params: [],
    required_authentication: true,
    access_roles: [getRoleId("super_admin"), getRoleId("admin")],
  },

  // Disable
  {
    activity_type: activityTypes.Update,
    module: moduleTypes.ServiceInformations,
    activity_name: activityName.disableServiceInformation,
    activity_code: activityCode.disableServiceInformation,
    activity_method: apiMethods.PATCH,
    url: "/api/v1/masters/service-informations/:id/disable",
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

export default serviceInformationApiData;
