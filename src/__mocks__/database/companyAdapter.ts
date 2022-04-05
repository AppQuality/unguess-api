import sqlite3 from "@src/features/sqlite";

import { table as customerTable, data as customerData } from "./customer";

import { table as profileTable, data as profileData } from "./profile";

import { table as projectTable, data as projectData } from "./project";

import { table as campaignTable, data as campaignData } from "./campaign";

import {
  table as userToProjectTable,
  data as userToProjectData,
} from "./user_to_project";

import {
  table as userToCustomerTable,
  data as userToCustomerData,
} from "./user_to_customer";

interface dataObject {
  profiles?: Array<any>;
  companies?: Array<any>;
  projects?: Array<any>;
  campaigns?: Array<any>;
  userToProjects?: Array<any>;
  userToCustomers?: Array<any>;
}

export const adapter = {
  create: async () => {
    await profileTable.create();
    await customerTable.create();
    await projectTable.create();
    await campaignTable.create();
    await userToCustomerTable.create();
    await userToProjectTable.create();
  },
  drop: async () => {
    await profileTable.drop();
    await customerTable.drop();
    await projectTable.drop();
    await campaignTable.drop();
    await userToCustomerTable.drop();
    await userToProjectTable.drop();
  },
  add: async ({
    profiles = [],
    companies = [],
    projects = [],
    campaigns = [],
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
