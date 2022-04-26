import { table as customerTable, data as customerData } from "./customer";
import { table as profileTable, data as profileData } from "./profile";
import { table as projectTable, data as projectData } from "./project";
import { table as campaignTable, data as campaignData } from "./campaign";
import {
  table as campaignTypeTable,
  data as campaignTypesData,
} from "./campaign_type";
import { table as userTable, data as userData } from "./user";

import {
  table as userToProjectTable,
  data as userToProjectData,
} from "./user_to_project";

import {
  table as userToCustomerTable,
  data as userToCustomerData,
} from "./user_to_customer";

import { table as featuresTable, data as featuresData } from "./features";

import {
  table as userToFeaturesTable,
  data as userToFeaturesData,
} from "./userToFeatures";

interface dataObject {
  profiles?: Array<any>;
  companies?: Array<any>;
  projects?: Array<any>;
  campaigns?: Array<any>;
  campaignTypes?: Array<any>;
  userToProjects?: Array<any>;
  userToCustomers?: Array<any>;
  users?: Array<any>;
  customers?: Array<any>;
}

export const adapter = {
  create: async () => {
    await profileTable.create();
    await customerTable.create();
    await projectTable.create();
    await campaignTable.create();
    await campaignTypeTable.create();
    await userToCustomerTable.create();
    await userToProjectTable.create();
    await userTable.create();
    await customerTable.create();

    //Features Table
    await featuresTable.create();
    await userToFeaturesTable.create();
  },
  drop: async () => {
    await profileTable.drop();
    await customerTable.drop();
    await projectTable.drop();
    await campaignTable.drop();
    await campaignTypeTable.drop();
    await userToCustomerTable.drop();
    await userToProjectTable.drop();
    await userTable.drop();
    await customerTable.drop();

    //Features Table
    await featuresTable.drop();
    await userToFeaturesTable.drop();
  },
  add: async ({
    profiles = [],
    companies = [],
    projects = [],
    campaigns = [],
    campaignTypes = [],
    userToProjects = [],
    userToCustomers = [],
  }: dataObject) => {
    profiles.length &&
      profiles.forEach(async (profile) => {
        await profileData.basicCustomer(profile);
      });

    companies.length &&
      companies.forEach(async (company) => {
        await customerData.basicItem(company);
      });

    projects.length &&
      projects.forEach(async (project) => {
        await projectData.basicProject(project);
      });

    campaigns.length &&
      campaigns.forEach(async (campaign) => {
        await campaignData.basicCampaign(campaign);
      });

    campaignTypes.length &&
      campaignTypes.forEach(async (campaignType) => {
        await campaignTypesData.basicItem(campaignType);
      });

    userToProjects.length &&
      userToProjects.forEach(async (userToProject) => {
        await userToProjectData.basicItem(userToProject);
      });

    userToCustomers.length &&
      userToCustomers.forEach(async (userToCustomer) => {
        await userToCustomerData.basicItem(userToCustomer);
      });
  },
};
