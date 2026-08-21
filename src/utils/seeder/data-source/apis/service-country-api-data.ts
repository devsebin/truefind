import { getRoleId } from "../../seeder-cookie";
import { activityTypes } from "../../../../utils/definitions/constants/activity-types";
import { AccessType, IAPI } from "../../../../utils/interfaces/api.interface";
import { moduleTypes } from "../../../../utils/definitions/constants/modules";
import { activityCode, activityName } from "../../activities/service-country-activities";
import { apiMethods } from "../../../../utils/definitions/constants/api-methods";

const serviceCountryApiData = (): IAPI[] => [
    {
        activity_type: activityTypes.Create,
        module: moduleTypes.ServiceCountryConfigurations,
        activity_name: activityName.createServiceCountry,
        activity_code: activityCode.createServiceCountry,
        activity_method: apiMethods.POST,
        url: "/api/v1/masters/service-country-configurations",
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
    {
        activity_type: activityTypes.List,
        module: moduleTypes.ServiceCountryConfigurations,
        activity_name: activityName.listServiceCountry,
        activity_code: activityCode.listServiceCountry,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/service-country-configurations",
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
    {
        activity_type: activityTypes.Show,
        module: moduleTypes.ServiceCountryConfigurations,
        activity_name: activityName.showServiceCountry,
        activity_code: activityCode.showServiceCountry,
        activity_method: apiMethods.GET,
        url: "/api/v1/masters/service-country-configurations/:id",
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
    {
        activity_type: activityTypes.Update,
        module: moduleTypes.ServiceCountryConfigurations,
        activity_name: activityName.updateServiceCountry,
        activity_code: activityCode.updateServiceCountry,
        activity_method: apiMethods.PUT,
        url: "/api/v1/masters/service-country-configurations/:id",
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
    {
        activity_type: activityTypes.Delete,
        module: moduleTypes.ServiceCountryConfigurations,
        activity_name: activityName.deleteServiceCountry,
        activity_code: activityCode.deleteServiceCountry,
        activity_method: apiMethods.DELETE,
        url: "/api/v1/masters/service-country-configurations/:id",
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

export default serviceCountryApiData;
