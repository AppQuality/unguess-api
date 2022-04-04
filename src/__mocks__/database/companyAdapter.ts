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
  profiles: Array<any>;
  companies: Array<any>;
  projects: Array<any>;
  campaigns: Array<any>;
  userToProjects: Array<any>;
  userToCustomers: Array<any>;
}

const db = sqlite3("tryber");

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
  add: async (params: dataObject) => {
    params.profiles &&
      params.profiles.forEach(async (profile) => {
        await profileData.basicCustomer(profile);
      });

    params.companies &&
      params.companies.forEach(async (company) => {
        await customerData.basicItem(company);
      });

    params.projects &&
      params.projects.forEach(async (project) => {
        await projectData.basicProject(project);
      });

    params.campaigns &&
      params.campaigns.forEach(async (campaign) => {
        await campaignData.basicCampaign(campaign);
      });

    params.userToProjects &&
      params.userToProjects.forEach(async (userToProject) => {
        await userToProjectData.basicItem(userToProject);
      });

    params.userToCustomers &&
      params.userToCustomers.forEach(async (userToCustomer) => {
        await userToCustomerData.basicItem(userToCustomer);
      });
  },
};
