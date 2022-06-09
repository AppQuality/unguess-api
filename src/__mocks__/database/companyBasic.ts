import companies from "@src/__mocks__/database/seed/companies.json";
import profiles from "@src/__mocks__/database/seed/profiles.json";
import projects from "@src/__mocks__/database/seed/projects.json";
import campaigns from "@src/__mocks__/database/seed/campaigns.json";
import users from "@src/__mocks__/database/seed/users.json";

export default {
  profiles: profiles,
  companies: companies,
  userToCustomers: profiles
    .slice(0, 2)
    .map((profile) => ({
      wp_user_id: profile.wp_user_id,
      customer_id: companies[0].id,
    }))
    .concat(
      profiles.slice(2).map((profile) => ({
        wp_user_id: profile.wp_user_id,
        customer_id: companies[1].id,
      }))
    ),
  projects: projects
    .slice(0, 2)
    .map((project) => ({
      ...project,
      customer_id: companies[0].id,
    }))
    .concat(
      projects.slice(2).map((project) => ({
        ...project,
        customer_id: companies[1].id,
      }))
    ),
  campaigns: campaigns
    .slice(0, campaigns.length / 2)
    .map((campaign) => ({
      ...campaign,
      project_id: projects[0].id,
    }))
    .concat(
      campaigns.slice(campaigns.length / 2).map((campaign) => ({
        ...campaign,
        project_id: projects[1].id,
      }))
    ),
  user_to_project: [
    //the first project is limited to the first user
    {
      wp_user_id: profiles[0].wp_user_id,
      project_id: projects[0].id,
    },
  ],
  user: users,
};
