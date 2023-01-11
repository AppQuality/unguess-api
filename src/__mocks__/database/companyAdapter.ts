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

import Coins from "./coins";
import {
  table as coinsTransactionsTable,
  data as coinsTransactionsData,
} from "./coins_transactions";
import campaignOutputs from "./cp_outputs_view";
import { table as expressTable, data as expressData } from "./express";
import defaultUsers from "@src/__mocks__/database/seed/users.json";

import UseCase from "@src/__mocks__/database/use_cases";
import useCaseGroup from "@src/__mocks__/database/use_case_group";
import { table as platformTable } from "@src/__mocks__/database/platforms";
import bugs from "@src/__mocks__/database/bugs";
import userTaskMedia from "@src/__mocks__/database/user_task_media";
import reports from "@src/__mocks__/database/report";
import bugSeverity from "@src/__mocks__/database/bug_severity";
import customSeverity from "@src/__mocks__/database/bug_severity_custom";
import bugReplicability from "@src/__mocks__/database/bug_replicability";
import bugType from "@src/__mocks__/database/bug_type";
import customBugType from "@src/__mocks__/database/bug_type_custom";
import bugStatus from "@src/__mocks__/database/bug_status";
import bugMedia from "@src/__mocks__/database/bug_media";
import devices from "@src/__mocks__/database/device";
import additionalField from "@src/__mocks__/database/campaign_additional_field";
import additionalFieldData from "@src/__mocks__/database/campaign_additional_field_data";
import candidates from "@src/__mocks__/database/cp_has_candidate";
import CampaignMeta from "@src/__mocks__/database/campaign_meta";
import tags from "@src/__mocks__/database/bug_tags";

import Templates from "@src/__mocks__/database/templates";
import Category from "@src/__mocks__/database/template_categories";
import userTask from "@src/__mocks__/database/user_task";
import customerUniqueBugsRead from "@src/__mocks__/database/customer_unique_bug_read";
import bugsReadStatus from "@src/__mocks__/database/bug_read_status";

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
    await Coins.mock();
    await coinsTransactionsTable.create();
    await expressTable.create();

    // Views
    await campaignOutputs.mock();

    await platformTable.create();
    await UseCase.mock();
    await useCaseGroup.mock();
    await bugs.mock();
    await userTaskMedia.mock();
    await reports.mock();
    await bugSeverity.mock();
    await customSeverity.mock();
    await bugReplicability.mock();
    await bugType.mock();
    await customBugType.mock();
    await bugStatus.mock();
    await bugMedia.mock();
    await devices.mock();
    await additionalField.mock();
    await additionalFieldData.mock();
    await candidates.mock();
    await CampaignMeta.mock();
    await Templates.mock();
    await Category.mock();
    await tags.mock();
    await userTask.mock();
    await customerUniqueBugsRead.mock();
    await bugsReadStatus.mock();
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
    await Coins.dropMock();
    await coinsTransactionsTable.drop();
    await expressTable.drop();

    // Views
    await campaignOutputs.dropMock();

    await platformTable.drop();
    await UseCase.dropMock();
    await useCaseGroup.dropMock();
    await userTaskMedia.dropMock();
    await bugs.dropMock();
    await userTaskMedia.dropMock();
    await reports.dropMock();
    await bugSeverity.dropMock();
    await customSeverity.dropMock();
    await bugReplicability.dropMock();
    await bugType.dropMock();
    await customBugType.dropMock();
    await bugStatus.dropMock();
    await bugMedia.dropMock();
    await devices.dropMock();
    await additionalField.dropMock();
    await additionalFieldData.dropMock();
    await candidates.dropMock();
    await CampaignMeta.dropMock();
    await tags.dropMock();
    await userTask.dropMock();
    await Templates.dropMock();
    await Category.dropMock();
    await customerUniqueBugsRead.dropMock();
    await bugsReadStatus.dropMock();
  },

  clear: async () => {
    await profileTable.clear();
    await customerTable.clear();
    await projectTable.clear();
    await campaignTable.clear();
    await campaignTypeTable.clear();
    await userToCustomerTable.clear();
    await userToProjectTable.clear();
    await userTable.clear();
    await customerTable.clear();
    await userTableUG.clear();

    //Features Tables
    await featuresTable.clear();
    await userToFeaturesTable.clear();

    // Express Tables
    await Coins.clear();
    await coinsTransactionsTable.clear();
    await expressTable.clear();

    await platformTable.clear();
    await UseCase.clear();
    await useCaseGroup.clear();
    await bugs.clear();
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
        await Coins.insert(coin);
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
