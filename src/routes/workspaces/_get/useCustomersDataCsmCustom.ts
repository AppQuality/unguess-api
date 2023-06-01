import { tryber } from "@src/features/database";

const useCustomersDataCsmCustom = () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().insert({
      id: 1,
      wp_user_id: 1,
      name: "Marco",
      surname: "Giuliani",
      email: "marco.giuliani@unguess.io",
      employment_id: 1,
      education_id: 1,
    });
    await tryber.tables.WpUsers.do().insert({
      ID: 1,
      user_url: "https://meetings.hubspot.com/marco.giuliani",
    });
    await tryber.tables.WpAppqCustomer.do().insert([
      {
        id: 1,
        company: "Company",
        company_logo: "logo.png",
        tokens: 100,
        pm_id: 1,
      },
      {
        id: 2,
        company: "Different Company",
        company_logo: "logo.png",
        tokens: 100,
        pm_id: 1,
      },
      {
        id: 3,
        company: "Zoom",
        company_logo: "logo.png",
        tokens: 100,
        pm_id: 1,
      },
    ]);
    await tryber.tables.WpAppqUserToCustomer.do().insert([
      {
        wp_user_id: 1,
        customer_id: 1,
      },
      {
        wp_user_id: 1,
        customer_id: 2,
      },
    ]);
  });
  afterAll(async () => {
    await tryber.tables.WpAppqCustomer.do().delete();
    await tryber.tables.WpAppqUserToCustomer.do().delete();

    await tryber.tables.WpAppqEvdProfile.do().delete();
    await tryber.tables.WpUsers.do().delete();
  });
};

export default useCustomersDataCsmCustom;
