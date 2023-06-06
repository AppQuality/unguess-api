import { tryber } from "@src/features/database";

const customer_2 = {
  id: 123,
  company: "Mela Inc.",
  company_logo: "logo999.png",
  tokens: 100,
  pm_id: 32,
};

const customer_1 = {
  id: 456,
  company: "PiccoloProgramma Corporation",
  company_logo: "logo999.png",
  tokens: 100,
  pm_id: 32,
};

const profile1 = {
  id: 1,
  name: "Mario",
  surname: "Rossi",
  email: "mario.rossi@example.com",
  wp_user_id: 1,
  employment_id: -1,
  education_id: -1,
};

const user1 = {
  ID: profile1.wp_user_id,
  user_email: profile1.email,
  user_login: profile1.email,
  user_pass: "password",
  user_nicename: profile1.email,
};

const profile2 = {
  ...profile1,
  id: 2,
  name: "Giovanni",
  surname: "Bianchi",
  email: "giovanni.bianchi@example.com",
  wp_user_id: 2,
};

const user2 = {
  ID: profile2.wp_user_id,
  user_email: profile2.email,
  user_login: profile2.email,
  user_pass: "password",
  user_nicename: profile2.email,
};

const profile3 = {
  ...profile1,
  id: 3,
  name: "Paolo",
  surname: "Verdi",
  email: "paolo.verdi@example.com",
  wp_user_id: 323,
};

const user3 = {
  ID: profile3.wp_user_id,
  user_email: profile3.email,
  user_login: profile3.email,
  user_pass: "password",
  user_nicename: profile3.email,
};

const prj1 = {
  id: 1,
  display_name: "Progettino uno",
  customer_id: customer_1.id,
  edited_by: profile1.id,
};

const prj2 = {
  id: 2,
  display_name: "Progettino due",
  customer_id: customer_2.id,
  edited_by: profile1.id,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: customer_1.id,
};

const user2_to_project_1 = {
  wp_user_id: profile2.wp_user_id,
  project_id: prj1.id,
};

const user3_to_project_2 = {
  wp_user_id: profile3.wp_user_id,
  project_id: prj2.id,
};

export const useBasicProjectsContext = () => {
  beforeAll(async () => {
    // Workspaces
    await tryber.tables.WpAppqCustomer.do().insert(customer_1);
    await tryber.tables.WpAppqCustomer.do().insert(customer_2);

    // Projects
    await tryber.tables.WpAppqProject.do().insert(prj1);
    await tryber.tables.WpAppqProject.do().insert(prj2);

    // User to customer
    await tryber.tables.WpAppqUserToCustomer.do().insert(user_to_customer_1); // user1 has workspace access
    await tryber.tables.WpAppqUserToProject.do().insert(user2_to_project_1); // user2 has only project access
    await tryber.tables.WpAppqUserToProject.do().insert(user3_to_project_2); // user3 has only project access

    // Users
    await tryber.tables.WpUsers.do().insert(user1);
    await tryber.tables.WpUsers.do().insert(user2);
    await tryber.tables.WpUsers.do().insert(user3);

    // Profiles
    await tryber.tables.WpAppqEvdProfile.do().insert(profile1);
    await tryber.tables.WpAppqEvdProfile.do().insert(profile2);
    await tryber.tables.WpAppqEvdProfile.do().insert(profile3);
  });

  afterAll(async () => {
    await tryber.tables.WpAppqCustomer.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqUserToCustomer.do().delete();
    await tryber.tables.WpUsers.do().delete();
    await tryber.tables.WpAppqEvdProfile.do().delete();
  });

  return {
    customer_1,
    customer_2,
    prj1,
    prj2,
    profile1,
    profile2,
    profile3,
  };
};
