import { tryber, unguess } from "@src/features/database";

const useCustomersData = () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().insert({
      id: 1,
      wp_user_id: 1,
      name: "Customer",
      surname: "Customer",
      email: "customer@unguess.io",
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
        pm_id: 0,
      },
      {
        id: 2,
        company: "Company",
        company_logo: "logo.png",
        tokens: 100,
        pm_id: 0,
      },
      {
        id: 43,
        company: "Company",
        company_logo: "logo.png",
        tokens: 100,
        pm_id: 0,
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
    await unguess.tables.WpUgCoins.do().insert([
      {
        id: 1,
        customer_id: 1,
        amount: 100,
        price: 0,
        created_on: "2022-06-24 12:47:30",
        updated_on: "2022-06-24 12:51:23",
      },
      {
        id: 2,
        customer_id: 1,
        amount: 50,
        price: 0,
        created_on: "2022-06-24 12:47:30",
        updated_on: "2022-06-24 12:51:23",
      },
      {
        id: 3,
        customer_id: 2,
        amount: 100,
        price: 0,
        created_on: "2022-06-24 12:47:30",
        updated_on: "2022-06-24 12:51:23",
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

export default useCustomersData;
