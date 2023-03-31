import Customer, { CustomerParams, data as customerData } from "./customer";
import { table as profileTable, data as profileData } from "./profile";
import Projects, { ProjectParams, data as projectData } from "./project";
import Campaigns, { CampaignsParams, data as campaignData } from "./campaign";
import {
  table as campaignTypeTable,
  data as campaignTypesData,
} from "./campaign_type";
import { table as userTable, data as userData } from "./user";
import { table as userTableUG, data as userDataUG } from "./user_unguess";

import UserToProjects, {
  UserToProjectParams,
  data as userToProjectData,
} from "./user_to_project";

import UserToCustomer, {
  UserToCustomerParams,
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

import priorities from "./priority";
import bugsPriorities from "./bug_priority";

import customStatuses from "./customStatus";
import bugCustomStatus from "./custom_bug_status";

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
import customReplicabilities from "@src/__mocks__/database/bug_replicability_custom";
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
import campaignReadStatuses from "@src/__mocks__/database/campaign_read_status";

interface dataObject {
  profiles?: Array<any>;
  companies?: Array<any>;
  projects?: Array<ProjectParams>;
  campaigns?: Array<CampaignsParams>;
  campaignTypes?: Array<any>;
  userToProjects?: Array<UserToProjectParams>;
  userToCustomers?: Array<UserToCustomerParams>;
  userToFeatures?: Array<any>;
  features?: Array<any>;
  users?: Array<any>;
  customers?: Array<CustomerParams>;
  coins?: Array<any>;
  transactions?: Array<any>;
  express?: Array<any>;
  unguess_users?: Array<any>;
}

export const adapter = {
  create: async () => {
    await profileTable.create();
    await Customer.mock();
    await Projects.mock();
    await Campaigns.mock();
    await campaignTypeTable.create();
    await UserToCustomer.mock();
    await UserToProjects.mock();
    await userTable.create();
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
    await customReplicabilities.mock();
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
    await campaignReadStatuses.mock();
    await priorities.mock();
    await bugsPriorities.mock();
    await customStatuses.mock();
    await bugCustomStatus.mock()
  },
  drop: async () => {
    await profileTable.drop();
    await Customer.dropMock();
    await Projects.dropMock();
    await Campaigns.dropMock();
    await campaignTypeTable.drop();
    await UserToCustomer.dropMock();
    await UserToProjects.dropMock();
    await userTable.drop();
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
    await customReplicabilities.dropMock();
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
    await campaignReadStatuses.dropMock();
    await priorities.dropMock();
    await bugsPriorities.dropMock();
    await customStatuses.dropMock();
    await bugCustomStatus.dropMock();
  },

  clear: async () => {
    await profileTable.clear();
    await Customer.clear();
    await Projects.clear();
    await Campaigns.clear();
    await campaignTypeTable.clear();
    await UserToCustomer.clear();
    await UserToProjects.clear();
    await userTable.clear();
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
    await campaignReadStatuses.clear();
    await userTaskMedia.clear();
    await priorities.clear();
    await bugsPriorities.clear();
    await customStatuses.clear();
    await bugCustomStatus.clear();
  },
  addCampaignWithProject: async ({
    campaign_id,
    project_id,
    wp_user_id,
    customer_id,
    ...rest
  }: {
    campaign_id: number;
    project_id?: number;
    wp_user_id?: number;
    customer_id?: number;

    project?: ProjectParams;
    campaign?: CampaignsParams;
    customer?: CustomerParams;
  }) => {
    await Campaigns.insert({
      ...rest.campaign,
      id: campaign_id,
      project_id,
    });

    const project = await Projects.all(undefined, [{ id: project_id }]);
    if (project.length === 0) {
      await Projects.insert({
        ...rest.project,
        id: project_id,
        customer_id: customer_id,
      });
    }

    const customer = await Customer.all(undefined, [{ id: customer_id }]);
    if (customer.length === 0) {
      await Customer.insert({
        ...rest.customer,
        id: customer_id,
      });
    }

    await UserToCustomer.insert({
      wp_user_id: wp_user_id,
      customer_id: customer_id,
    });
    await UserToProjects.insert({
      wp_user_id: wp_user_id,
      project_id: project_id,
    });
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
