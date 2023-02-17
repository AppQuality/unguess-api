import WpAppqUniqueBugRead from "./unguess/WpAppqUniqueBugRead";
import WpCommentmeta from "./unguess/WpCommentmeta";
import WpComments from "./unguess/WpComments";
import WpLinks from "./unguess/WpLinks";
import WpOptions from "./unguess/WpOptions";
import WpPostmeta from "./unguess/WpPostmeta";
import WpPosts from "./unguess/WpPosts";
import WpTermRelationships from "./unguess/WpTermRelationships";
import WpTermTaxonomy from "./unguess/WpTermTaxonomy";
import WpTermmeta from "./unguess/WpTermmeta";
import WpTerms from "./unguess/WpTerms";
import WpUgCampaignReadStatus from "./unguess/WpUgCampaignReadStatus";
import WpUgCoins from "./unguess/WpUgCoins";
import WpUgCoinsTransactions from "./unguess/WpUgCoinsTransactions";
import WpUgExpress from "./unguess/WpUgExpress";
import WpUgFeatures from "./unguess/WpUgFeatures";
import WpUgTemplateCategories from "./unguess/WpUgTemplateCategories";
import WpUgTemplates from "./unguess/WpUgTemplates";
import WpUgUserToFeature from "./unguess/WpUgUserToFeature";
import WpUnguessUserToCustomer from "./unguess/WpUnguessUserToCustomer";
import WpUsermeta from "./unguess/WpUsermeta";
import WpUsers from "./unguess/WpUsers";

export const create = async () => {
  await WpAppqUniqueBugRead.create();
  await WpCommentmeta.create();
  await WpComments.create();
  await WpLinks.create();
  await WpOptions.create();
  await WpPostmeta.create();
  await WpPosts.create();
  await WpTermRelationships.create();
  await WpTermTaxonomy.create();
  await WpTermmeta.create();
  await WpTerms.create();
  await WpUgCampaignReadStatus.create();
  await WpUgCoins.create();
  await WpUgCoinsTransactions.create();
  await WpUgExpress.create();
  await WpUgFeatures.create();
  await WpUgTemplateCategories.create();
  await WpUgTemplates.create();
  await WpUgUserToFeature.create();
  await WpUnguessUserToCustomer.create();
  await WpUsermeta.create();
  await WpUsers.create();
};
export const drop = async () => {
  await WpAppqUniqueBugRead.drop();
  await WpCommentmeta.drop();
  await WpComments.drop();
  await WpLinks.drop();
  await WpOptions.drop();
  await WpPostmeta.drop();
  await WpPosts.drop();
  await WpTermRelationships.drop();
  await WpTermTaxonomy.drop();
  await WpTermmeta.drop();
  await WpTerms.drop();
  await WpUgCampaignReadStatus.drop();
  await WpUgCoins.drop();
  await WpUgCoinsTransactions.drop();
  await WpUgExpress.drop();
  await WpUgFeatures.drop();
  await WpUgTemplateCategories.drop();
  await WpUgTemplates.drop();
  await WpUgUserToFeature.drop();
  await WpUnguessUserToCustomer.drop();
  await WpUsermeta.drop();
  await WpUsers.drop();
};
