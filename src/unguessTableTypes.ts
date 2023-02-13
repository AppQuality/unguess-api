import { Knex } from "knex";
declare module "knex/types/tables" {
  interface iWpAppqUniqueBugRead {
    wp_user_id: number;
    campaign_id: number;
    bugs_read: number;
    update_time: string;
  }
  interface iWpCommentmeta {
    meta_id: number;
    comment_id: number;
    meta_key: string;
    meta_value: string;
  }
  interface iWpComments {
    comment_ID: number;
    comment_post_ID: number;
    comment_author: string;
    comment_author_email: string;
    comment_author_url: string;
    comment_author_IP: string;
    comment_date: string;
    comment_date_gmt: string;
    comment_content: string;
    comment_karma: number;
    comment_approved: string;
    comment_agent: string;
    comment_type: string;
    comment_parent: number;
    user_id: number;
  }
  interface iWpLinks {
    link_id: number;
    link_url: string;
    link_name: string;
    link_image: string;
    link_target: string;
    link_description: string;
    link_visible: string;
    link_owner: number;
    link_rating: number;
    link_updated: string;
    link_rel: string;
    link_notes: string;
    link_rss: string;
  }
  interface iWpOptions {
    option_id: number;
    option_name: string;
    option_value: string;
    autoload: string;
  }
  interface iWpPostmeta {
    meta_id: number;
    post_id: number;
    meta_key: string;
    meta_value: string;
  }
  interface iWpPosts {
    ID: number;
    post_author: number;
    post_date: string;
    post_date_gmt: string;
    post_content: string;
    post_title: string;
    post_excerpt: string;
    post_status: string;
    comment_status: string;
    ping_status: string;
    post_password: string;
    post_name: string;
    to_ping: string;
    pinged: string;
    post_modified: string;
    post_modified_gmt: string;
    post_content_filtered: string;
    post_parent: number;
    guid: string;
    menu_order: number;
    post_type: string;
    post_mime_type: string;
    comment_count: number;
  }
  interface iWpTermRelationships {
    object_id: number;
    term_taxonomy_id: number;
    term_order: number;
  }
  interface iWpTermTaxonomy {
    term_taxonomy_id: number;
    term_id: number;
    taxonomy: string;
    description: string;
    parent: number;
    count: number;
  }
  interface iWpTermmeta {
    meta_id: number;
    term_id: number;
    meta_key: string;
    meta_value: string;
  }
  interface iWpTerms {
    term_id: number;
    name: string;
    slug: string;
    term_group: number;
  }
  interface iWpUgCampaignReadStatus {
    id: number;
    unguess_wp_user_id: number;
    campaign_id: number;
    is_read: number;
    read_on: string;
    last_read_on: string;
  }
  interface iWpUgCoins {
    id: number;
    customer_id: number;
    amount: number;
    initial_amount: number;
    agreement_id: number;
    price: number;
    created_on: string;
    updated_on: string;
    notes: string;
  }
  interface iWpUgCoinsTransactions {
    id: number;
    customer_id: number;
    profile_id: number;
    quantity: number;
    campaign_id: number;
    coins_package_id: number;
    created_on: string;
    notes: string;
  }
  interface iWpUgExpress {
    id: number;
    slug: string;
    cost: number;
  }
  interface iWpUgFeatures {
    id: number;
    slug: string;
    display_name: string;
  }
  interface iWpUgTemplateCategories {
    id: number;
    name: string;
    created_on: string;
  }
  interface iWpUgTemplates {
    id: number;
    title: string;
    description: string;
    content: string;
    category_id: number;
    device_type: string;
    image: string;
    locale: string;
    requires_login: number;
    created_on: string;
  }
  interface iWpUgUserToFeature {
    unguess_wp_user_id: number;
    feature_id: number;
  }
  interface iWpUnguessUserToCustomer {
    id: number;
    unguess_wp_user_id: number;
    tryber_wp_user_id: number;
    profile_id: number;
  }
  interface iWpUsermeta {
    umeta_id: number;
    user_id: number;
    meta_key: string;
    meta_value: string;
  }
  interface iWpUsers {
    ID: number;
    user_login: string;
    user_pass: string;
    user_nicename: string;
    user_email: string;
    user_url: string;
    user_registered: string;
    user_activation_key: string;
    user_status: number;
    display_name: string;
  }
  interface Tables {
    wp_appq_unique_bug_read: iWpAppqUniqueBugRead;
    wp_commentmeta: iWpCommentmeta;
    wp_comments: iWpComments;
    wp_links: iWpLinks;
    wp_options: iWpOptions;
    wp_postmeta: iWpPostmeta;
    wp_posts: iWpPosts;
    wp_term_relationships: iWpTermRelationships;
    wp_term_taxonomy: iWpTermTaxonomy;
    wp_termmeta: iWpTermmeta;
    wp_terms: iWpTerms;
    wp_ug_campaign_read_status: iWpUgCampaignReadStatus;
    wp_ug_coins: iWpUgCoins;
    wp_ug_coins_transactions: iWpUgCoinsTransactions;
    wp_ug_express: iWpUgExpress;
    wp_ug_features: iWpUgFeatures;
    wp_ug_template_categories: iWpUgTemplateCategories;
    wp_ug_templates: iWpUgTemplates;
    wp_ug_user_to_feature: iWpUgUserToFeature;
    wp_unguess_user_to_customer: iWpUnguessUserToCustomer;
    wp_usermeta: iWpUsermeta;
    wp_users: iWpUsers;
  }
}
