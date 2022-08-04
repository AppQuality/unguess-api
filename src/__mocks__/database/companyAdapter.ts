import { table as customerTable, data as customerData } from "./customer";
import { table as profileTable, data as profileData } from "./profile";
import { table as projectTable, data as projectData } from "./project";
import { table as campaignTable, data as campaignData } from "./campaign";
import {
  table as campaignTypeTable,
  data as campaignTypesData,
} from "./campaign_type";
import { table as userTable, data as userData } from "./user";
import { table as userTableUG, data as userDataUG } from "./user_unguess";

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

import { table as coinsTable, data as coinsData } from "./coins";
import {
  table as coinsTransactionsTable,
  data as coinsTransactionsData,
} from "./coins_transactions";

import { table as expressTable, data as expressData } from "./express";

import defaultUsers from "@src/__mocks__/database/seed/users.json";

interface dataObject {
  profiles?: Array<any>;
  companies?: Array<any>;
  projects?: Array<any>;
  campaigns?: Array<any>;
  campaignTypes?: Array<any>;
  userToProjects?: Array<any>;
  userToCustomers?: Array<any>;
  userToFeatures?: Array<any>;
  features?: Array<any>;
  users?: Array<any>;
  customers?: Array<any>;
  coins?: Array<any>;
  transactions?: Array<any>;
  express?: Array<any>;
  unguess_users?: Array<any>;
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
    await userTableUG.create();

    //Features Tables
    await featuresTable.create();
    await userToFeaturesTable.create();

    // Express Tables
    await coinsTable.create();
    await coinsTransactionsTable.create();
    await expressTable.create();
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
    await userTableUG.drop();

    //Features Tables
    await featuresTable.drop();
    await userToFeaturesTable.drop();

    // Express Tables
    await coinsTable.drop();
    await coinsTransactionsTable.drop();
    await expressTable.drop();
  },
  add: async ({
    profiles = [],
    companies = [],
    projects = [],
    campaigns = [],
    campaignTypes = [],
    userToProjects = [],
    userToCustomers = [],
    userToFeatures = [],
    features = [],
    users = [],
    coins = [],
    transactions = [],
    express = [],
    unguess_users = [],
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

    const usersList = [...defaultUsers, ...users];

    usersList.length &&
      usersList.forEach(async (user) => {
        await userData.basicUser(user);
      });

    coins.length &&
      coins.forEach(async (coin) => {
        await coinsData.basicItem(coin);
      });

    transactions.length &&
      transactions.forEach(async (transaction) => {
        await coinsTransactionsData.basicItem(transaction);
      });

    express.length &&
      express.forEach(async (expressItem) => {
        await expressData.basicItem(expressItem);
      });

    unguess_users.length &&
      unguess_users.forEach(async (user) => {
        await userDataUG.basicUser(user);
      });

    userToFeatures.length &&
      userToFeatures.forEach(async (userToFeature) => {
        await userToFeaturesData.basicItem(userToFeature);
      });

    features.length &&
      features.forEach(async (feature) => {
        await featuresData.basicItem(feature);
      });
  },
};
