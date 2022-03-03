export default {
    create: (options: any) => {
      return {
        checkAuth: (req: any) => {
          return {
            on: (event: any, callback: any) => {
              if (event === "auth") {
                return callback(false, 1);
              }
            },
          };
        },
      };
    },
  };