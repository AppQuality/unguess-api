import { Knex } from "knex";
declare module "knex/types/tables" {
  interface iKnexMigrations {
    id: number;
    name: string;
    batch: number;
    migration_time: string;
  }
  interface iKnexMigrationsLock {
    index: number;
    is_locked: number;
  }
  interface iWpAddactionsandfiltersPluginUsercode {
    id: number;
    enabled: number;
    shortcode: number;
    buffer: number;
    inadmin: number;
    name: string;
    capability: string;
    description: string;
    code: string;
  }
  interface iWpAppqActivityLevel {
    id: number;
    tester_id: number;
    level_id: number;
    start_date: string;
  }
  interface iWpAppqActivityLevelDefinition {
    id: number;
    name: string;
    reach_exp_pts: number;
    hold_exp_pts: number;
  }
  interface iWpAppqActivityLevelRev {
    id: number;
    tester_id: number;
    level_id: number;
    start_date: string;
    end_date: string;
  }
  interface iWpAppqAdditionalBugReplicabilities {
    id: number;
    campaign_id: number;
    version_id: number;
    bug_replicability_id: number;
  }
  interface iWpAppqAdditionalBugSeverities {
    id: number;
    campaign_id: number;
    version_id: number;
    bug_severity_id: number;
  }
  interface iWpAppqAdditionalBugTypes {
    id: number;
    campaign_id: number;
    version_id: number;
    bug_type_id: number;
  }
  interface iWpAppqAdminCommunication {
    id: number;
    title: string;
    content: string;
    success: number;
    fails: number;
    creation_date: string;
    campaign_id: number;
    pm_id: number;
  }
  interface iWpAppqAdminEmail {
    id: number;
    tester_id: number;
    dem_id: number;
    creation_date: string;
    is_read: number;
  }
  interface iWpAppqAdvCampaignCountry {
    id: number;
    name: string;
    code: string;
    sign: string;
  }
  interface iWpAppqAdvCampaignCta {
    id: number;
    code: string;
    dtm_cta: string;
    cta_behaviour: string;
    master_key: string;
    master_key_it: string;
  }
  interface iWpAppqAdvCampaignLanguage {
    id: number;
    name: string;
    code: string;
  }
  interface iWpAppqAdvCampaignLevel {
    id: number;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    assetId: string;
    source: string;
  }
  interface iWpAppqAdvCampaignResult {
    rule_id: number;
    cp_id: number;
    lead_hash: boolean;
    lead: string;
    status_id: number;
    creation: string;
    update: string;
    pm_id: number;
    note: string;
  }
  interface iWpAppqAdvCampaignRule {
    id: number;
    mk_field: string;
    co_field: string;
    validation_type: string;
    validation: string;
    co_activation_field: string;
    co_activation_value: string;
    value_if_error: number;
    creation: string;
    update: string;
    note: string;
    can_autoclose: number;
  }
  interface iWpAppqAdvDisclaimer {
    id: number;
    country: string;
    language: string;
    disclaimer: number;
  }
  interface iWpAppqAdvFieldsPosition {
    field_name: string;
    position: number;
  }
  interface iWpAppqAdvOptions {
    email: string;
    prj_id: number;
    email_cc: string;
    pm_id: number;
  }
  interface iWpAppqArenaApp {
    id: number;
    name: string;
    customer: string;
    description: string;
    is_active: number;
    is_published_on_bug_arena: number;
    app_logo: string;
    content_info: string;
    id_creator: number;
    id_modifier: number;
    created_on: string;
    last_edit: string;
    visibility_type: number;
    approved_tester: string;
    customer_id: number;
    pm_id: number;
    project_id: number;
    customer_title: string;
  }
  interface iWpAppqArenaVersion {
    id: number;
    bundle_id: string;
    name: string;
    code: string;
    platform_id: number;
    out_of_scope: string;
    whats_new: string;
    is_published_on_bug_arena: number;
    app_id: number;
    id_creator: number;
    id_modifier: number;
    pricing: string;
    is_active: number;
    applink: string;
    created_on: string;
    last_edit: string;
    campaign_pts: number;
    visibility_type: number;
    approved_tester: string;
    min_allowed_media: number;
    additional_info: string;
    is_website: number;
  }
  interface iWpAppqBtComponent {
    cp_id: number;
    component_name: string;
    component_key: string;
  }
  interface iWpAppqBtField {
    cp_id: number;
    field_name: string;
    field_key: string;
    field_array_key: string;
    field_value_type: string;
    type: string;
    string_value: string;
    mapping_id: number;
  }
  interface iWpAppqBtMapping {
    id: number;
    mapping_id: number;
    campaign_id: number;
    jira_field: string;
    out_value: string;
    in_value: string;
  }
  interface iWpAppqBugLink {
    id: number;
    bug_id: number;
    expiration: number;
    creation_date: string;
  }
  interface iWpAppqBugReadStatus {
    id: number;
    wp_id: number;
    bug_id: number;
    is_read: number;
    read_on: string;
  }
  interface iWpAppqBugTaxonomy {
    id: number;
    tag_id: number;
    display_name: string;
    slug: string;
    bug_id: number;
    campaign_id: number;
    description: string;
    author_wp_id: number;
    author_tid: number;
    creation_date: string;
    is_public: number;
  }
  interface iWpAppqCampaignAdditionalFields {
    id: number;
    cp_id: number;
    slug: string;
    title: string;
    type: string;
    validation: string;
    error_message: string;
    stats: number;
  }
  interface iWpAppqCampaignAdditionalFieldsData {
    bug_id: number;
    type_id: number;
    value: string;
  }
  interface iWpAppqCampaignCategory {
    id: number;
    name: string;
    tester_selection_xls: string;
    manual_template_id: number;
    preview_template_id: number;
    mailmerge_template_ids: string;
    use_case_template_ids: string;
    tester_coach_ids: string;
    automatic_user_olp_ids: string;
    automatic_olps: string;
  }
  interface iWpAppqCampaignClassificationClass {
    name: string;
  }
  interface iWpAppqCampaignClassificationFamily {
    name: string;
  }
  interface iWpAppqCampaignClassificationStatus {
    name: string;
  }
  interface iWpAppqCampaignPageTemplate {
    id: number;
    display_name: string;
    wp_template_name: string;
    template_type: number;
  }
  interface iWpAppqCampaignPageTemplatePart {
    id: number;
    field_name: string;
    type: string;
    extra: string;
  }
  interface iWpAppqCampaignPageTemplatePartData {
    id: number;
    campaign_page_template_id: number;
    campaign_page_template_part_id: number;
    field_default_value: string;
    locale: string;
  }
  interface iWpAppqCampaignPreselectionForm {
    id: number;
    campaign_id: number;
    name: string;
    author: number;
  }
  interface iWpAppqCampaignPreselectionFormData {
    id: number;
    campaign_id: number;
    field_id: number;
    value: string;
    tester_id: number;
  }
  interface iWpAppqCampaignPreselectionFormFields {
    id: number;
    form_id: number;
    question: string;
    short_name: string;
    type: string;
    options: string;
    priority: number;
  }
  interface iWpAppqCampaignStatus {
    id: number;
    display_name: string;
    description: string;
  }
  interface iWpAppqCampaignTask {
    id: number;
    title: string;
    content: string;
    jf_code: string;
    campaign_id: number;
    is_required: number;
    jf_text: string;
    group_id: number;
    position: number;
    allow_media: number;
    max_files: number;
    cluster_id: number;
    optimize_media: number;
    simple_title: string;
    info: string;
    prefix: string;
  }
  interface iWpAppqCampaignTaskGroup {
    task_id: number;
    group_id: number;
  }
  interface iWpAppqCampaignType {
    id: number;
    name: string;
    description: string;
    has_auto_apply: number;
    icon: string;
    type: number;
    category_id: number;
  }
  interface iWpAppqCampaignUseCaseTemplates {
    id: number;
    admin_title: string;
    title: string;
    content: string;
    jf_code: string;
    jf_text: string;
    is_required: number;
    group_id: number;
    position: number;
    allow_media: number;
    max_files: number;
  }
  interface iWpAppqCampaignUserPermissions {
    tester_id: number;
    cp_id: number;
    cap_read: number;
    cap_write: number;
    cap_review: number;
  }
  interface iWpAppqCertificationsList {
    id: number;
    name: string;
    abbreviation: string;
    area: string;
    institute: string;
  }
  interface iWpAppqClickDayCode {
    id: number;
    campaign_id: number;
    ragione_sociale: string;
    regione: string;
    code_to_play: string;
    category: string;
    creation: string;
    update: string;
  }
  interface iWpAppqClickDayResult {
    id: number;
    submission_id: string;
    ip: string;
    submission_date: string;
    campaign_id: number;
    tester_id: number;
    user_email: string;
    code_to_play: string;
    user_result: string;
    user_timestamp: string;
    user_image_url: string;
    pm_result: number;
    pm_timestamp: string;
    pm_id: number;
    creation: string;
    update: string;
    final_result: number;
  }
  interface iWpAppqClickDaySetup {
    id: number;
    campaign_id: number;
    tester_id: number;
    code_to_play: string;
    creation: string;
    update: string;
  }
  interface iWpAppqCompletedTutorial {
    tester_id: number;
    tutorial: string;
    completion_date: string;
  }
  interface iWpAppqContracts {
    id: number;
    tester_id: number;
    campaign_id: number;
    version_id: number;
    url: string;
    creation: string;
    update: string;
  }
  interface iWpAppqCourse {
    id: number;
    display_name: string;
    preview_content: string;
    completed_content: string;
    failed_content: string;
    euro_prize: number;
    point_prize: number;
    time_length: number;
    priority: number;
    course_level: string;
    is_public: number;
    completion_hook: string;
    language: string;
    translation_of_id: number;
    excerpt: string;
    career: string;
    level: number;
  }
  interface iWpAppqCourseAnswer {
    id: number;
    question_id: number;
    option_name: string;
    completion_date: string;
    is_correct: number;
  }
  interface iWpAppqCourseLesson {
    id: number;
    course_id: number;
    lesson_name: string;
    content: string;
    post_id: number;
    priority: number;
    is_quiz: number;
    quiz_question_number: number;
    quiz_question_target: number;
    failed_content: string;
  }
  interface iWpAppqCourseQuestion {
    id: number;
    course_id: number;
    lesson_id: number;
    question: string;
    priority: number;
  }
  interface iWpAppqCourseTesterAnswer {
    id: number;
    lesson_id: number;
    answer_id: number;
    tester_id: number;
    is_correct: number;
  }
  interface iWpAppqCourseTesterAnswerRev {
    id: number;
    lesson_id: number;
    answer_id: number;
    tester_id: number;
    is_correct: number;
    answer_time: string;
  }
  interface iWpAppqCourseTesterCertification {
    tester_id: number;
    course_id: number;
    cert_id: string;
    location: string;
    creation_date: string;
  }
  interface iWpAppqCourseTesterStatus {
    tester_id: number;
    course_id: number;
    start_date: string;
    completion_date: string;
    is_completed: number;
    last_lesson_id: number;
  }
  interface iWpAppqCpMeta {
    meta_id: number;
    campaign_id: number;
    meta_key: string;
    meta_value: string;
  }
  interface iWpAppqCpTestbook {
    id: number;
    cp_id: number;
    tc_id: number;
    tc_area: string;
    step_id: number;
    step_text: string;
    creation_date: string;
    creator_id: number;
    group_id: number;
  }
  interface iWpAppqCpTestbookStatus {
    id: number;
    display_name: string;
    to_trigger: string;
    style: string;
    icon: string;
    abbr: string;
  }
  interface iWpAppqCpTestbookStep {
    source_id: number;
    tester_id: number;
    step_id: number;
    status_id: number;
    bug_id: number;
    note: string;
    media_link: string;
    creation_date: string;
  }
  interface iWpAppqCronJobs {
    id: number;
    display_name: string;
    email_template_id: number;
    template_id: number;
    template_text: string;
    template_json: string;
    last_editor_id: number;
    campaign_id: number;
    creation_date: string;
    update_date: string;
    executed_on: string;
    subject: string;
    recipients: string;
    custom_group: string;
    sender_id: number;
    external_data: string;
    group_id: number;
  }
  interface iWpAppqCustomUserField {
    id: number;
    slug: string;
    name: string;
    placeholder: string;
    type: string;
    extras: string;
    can_be_null: number;
    priority: number;
    allow_other: number;
    enabled: number;
    custom_user_field_group_id: number;
    created_time: string;
    options: string;
  }
  interface iWpAppqCustomUserFieldData {
    id: number;
    custom_user_field_id: number;
    value: string;
    profile_id: number;
    candidate: number;
    last_update: string;
  }
  interface iWpAppqCustomUserFieldDependencies {
    id: number;
    custom_user_field_id: number;
    custom_user_field_dependency_id: number;
    custom_user_field_dependency_value: number;
  }
  interface iWpAppqCustomUserFieldExtras {
    id: number;
    custom_user_field_id: number;
    name: string;
    order: number;
  }
  interface iWpAppqCustomUserFieldGroupTranslation {
    id: number;
    field_id: number;
    name: string;
    description: string;
    lang: string;
  }
  interface iWpAppqCustomUserFieldGroups {
    id: number;
    name: string;
    description: string;
    priority: number;
  }
  interface iWpAppqCustomUserFieldTranslation {
    id: number;
    field_id: number;
    name: string;
    placeholder: string;
    lang: string;
  }
  interface iWpAppqCustomer {
    id: number;
    company: string;
    country: string;
    timezone_utc: number;
    language_code: string;
    company_logo: string;
    email: string;
    phone_number: string;
    pm_id: number;
    use_company_logo: number;
    tokens: number;
  }
  interface iWpAppqCustomerAccountInvitations {
    id: number;
    token: string;
    status: string;
    tester_id: number;
  }
  interface iWpAppqEducation {
    id: number;
    display_name: string;
  }
  interface iWpAppqEmployment {
    id: number;
    display_name: string;
    category: string;
  }
  interface iWpAppqEntryTestQuiz {
    id: number;
    campaign_id: number;
    title: string;
    description: string;
    expected: string;
    actual: string;
    available_types: string;
    available_severities: string;
    accepted_t: string;
    accepted_s: string;
    media_link: string;
  }
  interface iWpAppqEntryTestResponses {
    id: number;
    question_id: number;
    tester_id: number;
    selected_t: number;
    selected_s: number;
    creation_date: string;
    update_date: string;
  }
  interface iWpAppqEntryTestResponsesRev {
    id: number;
    question_id: number;
    tester_id: number;
    selected_t: number;
    selected_s: number;
    creation_date: string;
    update_date: string;
  }
  interface iWpAppqEvdApikeyCredentials {
    id: number;
    api_key: string;
  }
  interface iWpAppqEvdBasicCredentials {
    id: number;
    username: string;
    password: string;
  }
  interface iWpAppqEvdBitbucketSettings {
    id: number;
    auth_method: string;
  }
  interface iWpAppqEvdBitbucketSync {
    id: number;
    issue_key: string;
  }
  interface iWpAppqEvdBug {
    id: number;
    internal_id: string;
    wp_user_id: number;
    message: string;
    description: string;
    expected_result: string;
    current_result: string;
    campaign_id: number;
    status_id: number;
    publish: number;
    status_reason: string;
    severity_id: number;
    created: string;
    updated: string;
    bug_replicability_id: number;
    bug_type_id: number;
    last_seen: string;
    application_section: string;
    note: string;
    dev_id: number;
    manufacturer: string;
    model: string;
    os: string;
    os_version: string;
    last_seen_date: string;
    last_seen_time: string;
    version_id: number;
    reviewer: number;
    is_perfect: number;
    last_editor_id: number;
    last_editor_is_tester: number;
    is_duplicated: number;
    duplicated_of_id: number;
    is_favorite: number;
    application_section_id: number;
  }
  interface iWpAppqEvdBugMedia {
    id: number;
    type: string;
    title: string;
    description: string;
    location: string;
    bug_id: number;
    uploaded: string;
  }
  interface iWpAppqEvdBugReplicability {
    id: number;
    name: string;
    description: string;
  }
  interface iWpAppqEvdBugRev {
    id: number;
    bug_id: number;
    internal_id: string;
    wp_user_id: number;
    message: string;
    description: string;
    expected_result: string;
    current_result: string;
    campaign_id: number;
    version_id: number;
    status_id: number;
    publish: number;
    status_reason: string;
    bug_replicability_id: number;
    bug_type_id: number;
    severity_id: number;
    last_seen: string;
    last_seen_date: string;
    last_seen_time: string;
    application_section: string;
    bug_creation_date: string;
    bug_rev_creation: string;
    note: string;
    dev_id: number;
    manufacturer: string;
    model: string;
    os: string;
    os_version: string;
    reviewer: number;
    is_perfect: number;
    last_editor_id: number;
    last_editor_is_tester: number;
    is_duplicated: number;
    is_favorite: number;
    duplicated_of_id: number;
  }
  interface iWpAppqEvdBugStatus {
    id: number;
    name: string;
    description: string;
    icon: string;
  }
  interface iWpAppqEvdBugType {
    id: number;
    name: string;
    description: string;
    is_enabled: number;
  }
  interface iWpAppqEvdBugtrackerSettings {
    id: number;
    campaign_id: number;
    bug_tracker: string;
    settings_id: number;
    version_id: number;
  }
  interface iWpAppqEvdBugtrackerSync {
    id: number;
    bug_id: number;
    bug_tracker: string;
    sync_id: number;
  }
  interface iWpAppqEvdCampaign {
    id: number;
    platform_id: number;
    start_date: string;
    end_date: string;
    close_date: string;
    title: string;
    description: string;
    desired_number_of_testers: number;
    customer: string;
    platform_version: number;
    test_fairy_project: string;
    test_fairy_build: string;
    jot_form_prj: string;
    base_bug_internal_id: string;
    number_of_test_case: number;
    status_id: number;
    is_public: number;
    manual_link: string;
    preview_link: string;
    page_preview_id: number;
    page_manual_id: number;
    campaign_type: number;
    os: string;
    form_factor: string;
    low_bug_pts: number;
    medium_bug_pts: number;
    high_bug_pts: number;
    critical_bug_pts: number;
    campaign_pts: number;
    customer_id: number;
    pm_id: number;
    custom_link: string;
    min_allowed_media: number;
    campaign_type_id: number;
    project_id: number;
    customer_title: string;
    screen_on_every_step: number;
    tb_link: string;
    cust_bug_vis: number;
    bug_lang: number;
    aq_index: number;
    effort: number;
    tokens_usage: number;
    ux_effort: number;
    class: string;
    family: string;
    status_details: string;
  }
  interface iWpAppqEvdCampaignRev {
    id: number;
    campaign_id: number;
    platform_id: number;
    start_date: string;
    end_date: string;
    close_date: string;
    title: string;
    customer_title: string;
    description: string;
    desired_number_of_testers: number;
    platform_version: number;
    os: string;
    form_factor: string;
    base_bug_internal_id: string;
    number_of_test_case: number;
    status_id: number;
    is_public: number;
    manual_link: string;
    preview_link: string;
    page_preview_id: number;
    page_manual_id: number;
    min_allowed_media: number;
    campaign_type: number;
    campaign_type_id: number;
    campaign_pts: number;
    project_id: number;
    pm_id: number;
    custom_link: string;
    screen_on_every_step: number;
    tb_link: string;
    triggered_on: string;
    cust_bug_vis: number;
    bug_lang: number;
    aq_index: number;
    class: string;
    family: string;
    status_details: string;
  }
  interface iWpAppqEvdCredentials {
    id: number;
    campaign_id: number;
    auth_method: string;
    base_url: string;
    project_key: string;
    bug_tracker: string;
    credentials_id: number;
    version_id: number;
  }
  interface iWpAppqEvdJiraSettings {
    id: number;
    auth_method: string;
    custom_fields: number;
  }
  interface iWpAppqEvdJiraSync {
    id: number;
    issue_key: string;
  }
  interface iWpAppqEvdOauth1Credentials {
    id: number;
    consumer_key: string;
    private_key: string;
  }
  interface iWpAppqEvdOauth2Credentials {
    id: number;
    client_id: string;
    consumer_key: string;
  }
  interface iWpAppqEvdPlatform {
    id: number;
    name: string;
    form_factor: number;
    architecture: number;
  }
  interface iWpAppqEvdProfile {
    id: number;
    wp_user_id: number;
    name: string;
    surname: string;
    email: string;
    sex: number;
    birth_date: string;
    phone_number: string;
    city: string;
    address: string;
    postal_code: number;
    province: string;
    country: string;
    booty: number;
    payment_status: number;
    pending_booty: number;
    address_number: number;
    u2b_login_token: string;
    creation_time: string;
    fb_login_token: string;
    last_login: string;
    total_exp_pts: number;
    is_verified: number;
    ln_login_token: string;
    entry_test: number;
    entry_test_date: string;
    employment_id: number;
    education_id: number;
    state: string;
    country_code: string;
    is_special: number;
    last_modified: string;
    fb_leads_form_id: string;
    deletion_date: string;
    last_activity: string;
    blacklisted: number;
    onboarding_complete: number;
  }
  interface iWpAppqEvdRedmineSettings {
    id: number;
    auth_method: string;
    custom_fields: number;
  }
  interface iWpAppqEvdRedmineSync {
    id: number;
    issue_key: string;
  }
  interface iWpAppqEvdSeverity {
    id: number;
    name: string;
    description: string;
  }
  interface iWpAppqEvent {
    id: number;
    category: string;
    description: string;
    create: string;
    done: string;
    modified: string;
  }
  interface iWpAppqEventTransactionalMail {
    id: number;
    event_name: string;
    event_description: string;
    template_id: number;
    dynamic_fields: string;
    creation_time: string;
    last_modified: string;
    last_editor_tester_id: number;
  }
  interface iWpAppqExpPoints {
    id: number;
    tester_id: number;
    campaign_id: number;
    activity_id: number;
    reason: string;
    pm_id: number;
    creation_date: string;
    amount: number;
    bug_id: number;
    version_id: number;
  }
  interface iWpAppqFacebookLeadsAds {
    id: number;
    ads_id: number;
    ad_title: string;
    fb_status: string;
    fb_creation: string;
    auto_signup: number;
    cron_period: string;
  }
  interface iWpAppqFacebookLeadsImport {
    id: number;
    form_id: number;
    creation_date: string;
  }
  interface iWpAppqFiscalProfile {
    id: number;
    tester_id: number;
    fiscal_id: string;
    name: string;
    surname: string;
    sex: string;
    birth_date: string;
    birth_city: string;
    birth_province: string;
    birth_country: string;
    address: string;
    address_number: string;
    postal_code: string;
    city: string;
    province: string;
    country: string;
    fiscal_italian_residence: number;
    fiscal_category: number;
    withholding_tax_percentage: number;
    is_verified: number;
    verification_in_progress: number;
    is_active: number;
    verified_on: string;
    created_on: string;
    verification_notes: string;
  }
  interface iWpAppqIntegrationCenterBugs {
    bug_id: number;
    integration: string;
    upload_date: string;
    bugtracker_id: string;
  }
  interface iWpAppqIntegrationCenterConfig {
    campaign_id: number;
    integration: string;
    endpoint: string;
    apikey: string;
    field_mapping: string;
    is_active: number;
    upload_media: number;
  }
  interface iWpAppqIntegrationCenterCustomMap {
    campaign_id: number;
    source: string;
    name: string;
    map: string;
  }
  interface iWpAppqIntegrationCenterIntegrations {
    integration_id: number;
    integration_slug: string;
    integration_name: string;
    visible_to_customer: number;
  }
  interface iWpAppqLang {
    id: number;
    display_name: string;
    lang_code: string;
  }
  interface iWpAppqLcAccess {
    id: number;
    tester_id: number;
    view_id: number;
    edited_by: number;
    last_edit: string;
  }
  interface iWpAppqLcManufacturer {
    table_id: number;
    id: string;
    text: string;
  }
  interface iWpAppqLcMessages {
    id: number;
    campaign_id: number;
    tester_id: number;
    is_pm: number;
    is_read: number;
    message: string;
    msg_time: string;
    always_visible: number;
    is_popup: number;
    pm_id: number;
  }
  interface iWpAppqLcModel {
    id: number;
    id_manufacturer: string;
    name: string;
  }
  interface iWpAppqLcNetwork {
    id: number;
    text: string;
  }
  interface iWpAppqLcTasks {
    id: number;
    campaign_id: number;
    pm_id: number;
    message: string;
    status: number;
    task_time: string;
  }
  interface iWpAppqLcViewMeta {
    id: number;
    view_id: number;
    status_id: number;
  }
  interface iWpAppqMiRequest {
    id: number;
    bug_id: number;
    cp_id: number;
    request: string;
    wp_user_id: number;
    creation: string;
    expiration: string;
  }
  interface iWpAppqOlpPermissions {
    main_id: number;
    main_type: string;
    type: string;
    wp_user_id: number;
  }
  interface iWpAppqOs {
    id: number;
    platform_id: number;
    main_release: number;
    version_family: number;
    version_number: string;
    display_name: string;
  }
  interface iWpAppqPayment {
    id: number;
    tester_id: number;
    campaign_id: number;
    version_id: number;
    work_type: string;
    note: string;
    amount: number;
    is_requested: number;
    request_id: number;
    creation_date: string;
    is_paid: number;
    receipt_id: number;
    receipt_title: string;
    created_by: number;
    work_type_id: number;
  }
  interface iWpAppqPaymentRequest {
    id: number;
    tester_id: number;
    fiscal_id: string;
    address_street: string;
    address_city: string;
    address_country: string;
    paypal_email: string;
    bank_email: string;
    iban: string;
    bank: string;
    amount: number;
    amount_paypal_fee: number;
    amount_withholding: number;
    amount_gross: number;
    is_paid: number;
    request_date: string;
    paid_date: string;
    fiscal_italian_residence: number;
    fiscal_category: number;
    under_threshold: number;
    withholding_tax_percentage: number;
    stamp_required: number;
    stamp_paid_date: string;
    receipt_id: number;
    receipt_title: string;
    fiscal_profile_id: number;
    update_date: string;
    error_message: string;
    account_holder_name: string;
  }
  interface iWpAppqPaymentRequestHistory {
    id: number;
    original_id: number;
    tester_id: number;
    fiscal_id: string;
    address_street: string;
    address_city: string;
    address_country: string;
    paypal_email: string;
    bank_email: string;
    iban: string;
    bank: string;
    amount: number;
    amount_paypal_fee: number;
    amount_withholding: number;
    amount_gross: number;
    is_paid: number;
    request_date: string;
    paid_date: string;
    fiscal_italian_residence: number;
    fiscal_category: number;
    under_threshold: number;
    withholding_tax_percentage: number;
    stamp_required: number;
    stamp_paid_date: string;
    receipt_id: number;
    receipt_title: string;
    deleted_date: string;
    updated_date: string;
    note: string;
  }
  interface iWpAppqPaymentTwQuote {
    id: number;
    transaction_id: number;
    source_currency: string;
    target_currency: string;
    source_amount: number;
    target_amount: number;
    type: string;
    created_time: string;
    modification_time: string;
    created_by_user_id: number;
    operator_id: number;
    rate: string;
    delivery_estimate: string;
    fee: number;
  }
  interface iWpAppqPaymentTwRecipient {
    id: number;
    tester_id: number;
    currency: string;
    country: string;
    type: string;
    legal_type: string;
    tw_account_id: number;
    created_time: string;
    modification_time: string;
  }
  interface iWpAppqPaymentTwTransfer {
    id: number;
    tw_account: number;
    quote_id: number;
    customer_transaction_id: string;
    status: string;
    reference: string;
    created: string;
    has_active_issues: string;
    source_currency: string;
    source_amount: number;
    target_currency: string;
    target_amount: number;
    type: string;
    error_code: string;
    created_time: string;
    modification_time: string;
  }
  interface iWpAppqPaymentWorkTypes {
    id: number;
    work_type: string;
  }
  interface iWpAppqPaypalBulkTransaction {
    id: number;
    payout_batch_id: string;
    operator_id: number;
    creation_time: string;
    completed_time: string;
    status: string;
    amount_value: number;
    amount_currency: string;
    fee_value: number;
    fee_currency: string;
  }
  interface iWpAppqPaypalTransaction {
    id: number;
    request_id: number;
    payout_batch_id: string;
    notes: string;
    creation: string;
    update: string;
    transaction_id: string;
    transaction_status: string;
    payout_item_id: string;
    time_processed: string;
    receiver: string;
    amount_value: number;
    amount_currency: string;
    fee_value: number;
    fee_currency: string;
    sender_item_id: string;
    email_subject: string;
  }
  interface iWpAppqPlatform {
    id: number;
    name: string;
    form_factor: number;
  }
  interface iWpAppqPopups {
    id: number;
    title: string;
    content: string;
    is_once: number;
    targets: string;
    extras: string;
    is_auto: number;
    created_at: string;
    updated_at: string;
  }
  interface iWpAppqPopupsReadStatus {
    tester_id: number;
    popup_id: number;
  }
  interface iWpAppqProfileCertifications {
    id: number;
    institute: string;
    area: string;
    level: string;
    display_name: string;
    tester_id: number;
    achievement_date: string;
    creation_date: string;
    cert_id: number;
  }
  interface iWpAppqProfileEditTimestamp {
    tester_id: number;
    table_name: string;
    creation_date: string;
  }
  interface iWpAppqProfileHasLang {
    language_id: number;
    profile_id: number;
  }
  interface iWpAppqProfileSkills {
    id: number;
    display_name: string;
    tester_id: number;
    rating: number;
    is_certified: number;
    creation_date: string;
  }
  interface iWpAppqProfileSkillsSrc {
    id: number;
    display_name: string;
    creation_date: string;
    is_certification: number;
  }
  interface iWpAppqProject {
    id: number;
    display_name: string;
    customer_id: number;
    edited_by: number;
    created_on: string;
    last_edit: string;
  }
  interface iWpAppqProspectPayout {
    id: number;
    campaign_id: number;
    tester_id: number;
    complete_pts: number;
    extra_pts: number;
    complete_eur: number;
    bonus_bug_eur: number;
    extra_eur: number;
    refund: number;
    notes: string;
    is_edit: number;
  }
  interface iWpAppqQualityBadge {
    id: number;
    customer_id: number;
    size: string;
    theme: string;
    token: string;
    public_content: string;
    is_active: number;
    created_by: number;
    creation_date: string;
  }
  interface iWpAppqReceipt {
    id: number;
    tester_personal_receipt_id: string;
    tester_id: number;
    payment_id: number;
    url: string;
    creation: string;
    update: string;
  }
  interface iWpAppqReferralData {
    id: number;
    campaign_id: number;
    tester_id: number;
    referrer_id: number;
  }
  interface iWpAppqReport {
    id: number;
    title: string;
    campaign_id: number;
    uploader_id: number;
    description: string;
    url: string;
    creation_date: string;
    update_date: string;
  }
  interface iWpAppqStatusReasonText {
    id: number;
    display_name: string;
    content: string;
  }
  interface iWpAppqStatusReasonUsage {
    id: number;
    message_id: number;
    bug_id: number;
    pm_id: number;
    creation_date: string;
  }
  interface iWpAppqTaskAdditionalData {
    id: number;
    task_id: number;
    tester_id: number;
    data_key: string;
    data_value: string;
  }
  interface iWpAppqTesterJotformSubmissions {
    id: number;
    form_id: string;
    submission_id: string;
    tester_id: number;
    creation_date: string;
  }
  interface iWpAppqTicket {
    id: number;
    bug_id: number;
    creation_date: string;
    update_date: string;
    causal: string;
    pm_id: number;
  }
  interface iWpAppqUnlayerBlockTemplate {
    id: number;
    name: string;
    html_body: string;
    json_body: string;
    creation_time: string;
    last_modified: string;
    last_editor_tester_id: number;
    lang: string;
    category_id: number;
  }
  interface iWpAppqUnlayerCategory {
    id: number;
    name: string;
    description: string;
  }
  interface iWpAppqUnlayerMailTemplate {
    id: number;
    name: string;
    html_body: string;
    json_body: string;
    creation_time: string;
    last_modified: string;
    last_editor_tester_id: number;
    lang: string;
    category_id: number;
  }
  interface iWpAppqUploadedMedia {
    id: number;
    url: string;
    creation_date: string;
  }
  interface iWpAppqUsecaseCluster {
    id: number;
    campaign_id: number;
    title: string;
    subtitle: string;
  }
  interface iWpAppqUsecaseMediaObservations {
    id: number;
    media_id: number;
    video_ts: number;
    name: string;
    description: string;
    ux_note: string;
    favorite: number;
  }
  interface iWpAppqUsecaseMediaObservationsTags {
    id: number;
    name: string;
    style: string;
    type: number;
  }
  interface iWpAppqUsecaseMediaObservationsTagsLink {
    id: number;
    tag_id: number;
    observation_id: number;
  }
  interface iWpAppqUsecaseMediaReadStatus {
    id: number;
    use_case_media_id: number;
    wp_user_id: number;
    is_read: number;
  }
  interface iWpAppqUsecaseMediaShare {
    id: number;
    media_id: number;
    share_link: string;
    creation_date: string;
  }
  interface iWpAppqUsecaseMediaTagType {
    id: number;
    campaign_id: number;
    name: string;
  }
  interface iWpAppqUserDeletionReason {
    tester_id: number;
    reason: string;
  }
  interface iWpAppqUserTask {
    id: number;
    tester_id: number;
    task_id: number;
    is_completed: number;
    creation_date: string;
  }
  interface iWpAppqUserTaskMedia {
    id: number;
    campaign_task_id: number;
    user_task_id: number;
    tester_id: number;
    filename: string;
    size: number;
    location: string;
    creation_date: string;
    status: number;
    favorite: number;
    manufacturer: string;
    model: string;
    pc_type: string;
    platform_id: number;
    os_version_id: number;
    form_factor: string;
  }
  interface iWpAppqUserToCustomer {
    wp_user_id: number;
    customer_id: number;
  }
  interface iWpAppqUserToProject {
    wp_user_id: number;
    project_id: number;
  }
  interface iWpCdTestQuestion {
    id: number;
    creation_time: string;
    update_time: string;
    title: string;
    question: string;
    answer: string;
  }
  interface iWpCdTestResults {
    id: number;
    creation_time: string;
    secs: string;
    response: string;
    success: number;
    question_id: number;
    tester_id: number;
    seconds: number;
    errors: number;
    errors_details: string;
    version: number;
  }
  interface iWpCliCookieScan {
    id_cli_cookie_scan: number;
    status: number;
    created_at: number;
    total_url: number;
    total_cookies: number;
    current_action: string;
    current_offset: number;
  }
  interface iWpCliCookieScanCategories {
    id_cli_cookie_category: number;
    cli_cookie_category_name: string;
    cli_cookie_category_description: string;
  }
  interface iWpCliCookieScanCookies {
    id_cli_cookie_scan_cookies: number;
    id_cli_cookie_scan: number;
    id_cli_cookie_scan_url: number;
    cookie_id: string;
    expiry: string;
    type: string;
    category: string;
    category_id: number;
    description: string;
  }
  interface iWpCliCookieScanUrl {
    id_cli_cookie_scan_url: number;
    id_cli_cookie_scan: number;
    url: string;
    scanned: number;
    total_cookies: number;
  }
  interface iWpCliScripts {
    id: number;
    cliscript_title: string;
    cliscript_category: string;
    cliscript_type: number;
    cliscript_status: string;
    cliscript_description: string;
    cliscript_key: string;
    type: number;
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
  interface iWpCrowdAppqDevice {
    id: number;
    manufacturer: string;
    model: string;
    network: string;
    platform_id: number;
    id_profile: number;
    os_version: string;
    operating_system: string;
    enabled: number;
    form_factor: string;
    creation_time: string;
    pc_type: string;
    os_version_id: number;
    architecture: number;
    source_id: number;
    update_time: string;
  }
  interface iWpCrowdAppqHasCandidate {
    user_id: number;
    campaign_id: number;
    subscription_date: string;
    accepted: number;
    devices: string;
    selected_device: number;
    results: number;
    modified: string;
    group_id: number;
  }
  interface iWpDcAppqAcceptedProperties {
    id: number;
    internal_name: string;
  }
  interface iWpDcAppqApiHaveScope {
    id: number;
    key_id: number;
    scope_id: number;
    creation_date: string;
  }
  interface iWpDcAppqApiKeys {
    id: number;
    api_name: string;
    prefix: string;
    key_hashed: string;
    author_user_id: number;
    creation_date: string;
  }
  interface iWpDcAppqApiScopes {
    id: number;
    display_name: string;
    creation_date: string;
  }
  interface iWpDcAppqConnectorSettings {
    id: number;
    field_name: string;
    field_value: string;
    creation_date: string;
  }
  interface iWpDcAppqDevices {
    id: number;
    manufacturer: string;
    model: string;
    platform_id: number;
    os_version: string;
    device_type: number;
    display_size: number;
    display_width: number;
    display_height: number;
    display_ppi: number;
    device_height: number;
    device_width: number;
    device_length: number;
    has_nfc: number;
    has_fingerprint: number;
    has_face_unlock: number;
    biometrics: string;
    connectivity: string;
    creation_time: string;
    update_time: string;
    source_id: number;
  }
  interface iWpDcAppqPluginSync {
    id: number;
    is_auto_sync: number;
    is_successfully: number;
    error_message: string;
    devices_updated: number;
    sync_date: string;
  }
  interface iWpFormsApplication {
    id: number;
    campaign_id: string;
    tester_id: string;
    tester_mail: string;
    jotform_id: string;
    submission_id: string;
    form_title: string;
    tester_ip: string;
    rawRequest: string;
    pretty_data: string;
    creation_date: string;
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
  interface iWpRedirection404 {
    id: number;
    created: string;
    url: string;
    domain: string;
    agent: string;
    referrer: string;
    http_code: number;
    request_method: string;
    request_data: string;
    ip: string;
  }
  interface iWpRedirectionGroups {
    id: number;
    name: string;
    tracking: number;
    module_id: number;
    status: string;
    position: number;
  }
  interface iWpRedirectionItems {
    id: number;
    url: string;
    match_url: string;
    match_data: string;
    regex: number;
    position: number;
    last_count: number;
    last_access: string;
    group_id: number;
    status: string;
    action_type: string;
    action_code: number;
    action_data: string;
    match_type: string;
    title: string;
  }
  interface iWpRedirectionLogs {
    id: number;
    created: string;
    url: string;
    domain: string;
    sent_to: string;
    agent: string;
    referrer: string;
    http_code: number;
    request_method: string;
    request_data: string;
    redirect_by: string;
    redirection_id: number;
    ip: string;
  }
  interface iWpSignups {
    signup_id: number;
    domain: string;
    path: string;
    title: string;
    user_login: string;
    user_email: string;
    registered: string;
    activated: string;
    active: number;
    activation_key: string;
    meta: string;
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
  interface iWpWpmmSubscribers {
    id_subscriber: number;
    email: string;
    insert_date: string;
  }
  interface iWpYoastIndexable {
    id: number;
    permalink: string;
    permalink_hash: string;
    object_id: number;
    object_type: string;
    object_sub_type: string;
    author_id: number;
    post_parent: number;
    title: string;
    description: string;
    breadcrumb_title: string;
    post_status: string;
    is_public: number;
    is_protected: number;
    has_public_posts: number;
    number_of_pages: number;
    canonical: string;
    primary_focus_keyword: string;
    primary_focus_keyword_score: number;
    readability_score: number;
    is_cornerstone: number;
    is_robots_noindex: number;
    is_robots_nofollow: number;
    is_robots_noarchive: number;
    is_robots_noimageindex: number;
    is_robots_nosnippet: number;
    twitter_title: string;
    twitter_image: string;
    twitter_description: string;
    twitter_image_id: string;
    twitter_image_source: string;
    open_graph_title: string;
    open_graph_description: string;
    open_graph_image: string;
    open_graph_image_id: string;
    open_graph_image_source: string;
    open_graph_image_meta: string;
    link_count: number;
    incoming_link_count: number;
    prominent_words_version: number;
    created_at: string;
    updated_at: string;
    blog_id: number;
    language: string;
    region: string;
    schema_page_type: string;
    schema_article_type: string;
    has_ancestors: number;
    estimated_reading_time_minutes: number;
  }
  interface iWpYoastIndexableHierarchy {
    indexable_id: number;
    ancestor_id: number;
    depth: number;
    blog_id: number;
  }
  interface iWpYoastMigrations {
    id: number;
    version: string;
  }
  interface iWpYoastPrimaryTerm {
    id: number;
    post_id: number;
    term_id: number;
    taxonomy: string;
    created_at: string;
    updated_at: string;
    blog_id: number;
  }
  interface iWpYoastSeoLinks {
    id: number;
    url: string;
    post_id: number;
    target_post_id: number;
    type: string;
    indexable_id: number;
    target_indexable_id: number;
    height: number;
    width: number;
    size: number;
    language: string;
    region: string;
  }
  interface iWpYoastSeoMeta {
    object_id: number;
    internal_link_count: number;
    incoming_link_count: number;
  }
  interface Tables {
    knex_migrations: iKnexMigrations;
    knex_migrations_lock: iKnexMigrationsLock;
    wp_addactionsandfilters_plugin_usercode: iWpAddactionsandfiltersPluginUsercode;
    wp_appq_activity_level: iWpAppqActivityLevel;
    wp_appq_activity_level_definition: iWpAppqActivityLevelDefinition;
    wp_appq_activity_level_rev: iWpAppqActivityLevelRev;
    wp_appq_additional_bug_replicabilities: iWpAppqAdditionalBugReplicabilities;
    wp_appq_additional_bug_severities: iWpAppqAdditionalBugSeverities;
    wp_appq_additional_bug_types: iWpAppqAdditionalBugTypes;
    wp_appq_admin_communication: iWpAppqAdminCommunication;
    wp_appq_admin_email: iWpAppqAdminEmail;
    wp_appq_adv_campaign_country: iWpAppqAdvCampaignCountry;
    wp_appq_adv_campaign_cta: iWpAppqAdvCampaignCta;
    wp_appq_adv_campaign_language: iWpAppqAdvCampaignLanguage;
    wp_appq_adv_campaign_level: iWpAppqAdvCampaignLevel;
    wp_appq_adv_campaign_result: iWpAppqAdvCampaignResult;
    wp_appq_adv_campaign_rule: iWpAppqAdvCampaignRule;
    wp_appq_adv_disclaimer: iWpAppqAdvDisclaimer;
    wp_appq_adv_fields_position: iWpAppqAdvFieldsPosition;
    wp_appq_adv_options: iWpAppqAdvOptions;
    wp_appq_arena_app: iWpAppqArenaApp;
    wp_appq_arena_version: iWpAppqArenaVersion;
    wp_appq_bt_component: iWpAppqBtComponent;
    wp_appq_bt_field: iWpAppqBtField;
    wp_appq_bt_mapping: iWpAppqBtMapping;
    wp_appq_bug_link: iWpAppqBugLink;
    wp_appq_bug_read_status: iWpAppqBugReadStatus;
    wp_appq_bug_taxonomy: iWpAppqBugTaxonomy;
    wp_appq_campaign_additional_fields: iWpAppqCampaignAdditionalFields;
    wp_appq_campaign_additional_fields_data: iWpAppqCampaignAdditionalFieldsData;
    wp_appq_campaign_category: iWpAppqCampaignCategory;
    wp_appq_campaign_classification_class: iWpAppqCampaignClassificationClass;
    wp_appq_campaign_classification_family: iWpAppqCampaignClassificationFamily;
    wp_appq_campaign_classification_status: iWpAppqCampaignClassificationStatus;
    wp_appq_campaign_page_template: iWpAppqCampaignPageTemplate;
    wp_appq_campaign_page_template_part: iWpAppqCampaignPageTemplatePart;
    wp_appq_campaign_page_template_part_data: iWpAppqCampaignPageTemplatePartData;
    wp_appq_campaign_preselection_form: iWpAppqCampaignPreselectionForm;
    wp_appq_campaign_preselection_form_data: iWpAppqCampaignPreselectionFormData;
    wp_appq_campaign_preselection_form_fields: iWpAppqCampaignPreselectionFormFields;
    wp_appq_campaign_status: iWpAppqCampaignStatus;
    wp_appq_campaign_task: iWpAppqCampaignTask;
    wp_appq_campaign_task_group: iWpAppqCampaignTaskGroup;
    wp_appq_campaign_type: iWpAppqCampaignType;
    wp_appq_campaign_use_case_templates: iWpAppqCampaignUseCaseTemplates;
    wp_appq_campaign_user_permissions: iWpAppqCampaignUserPermissions;
    wp_appq_certifications_list: iWpAppqCertificationsList;
    wp_appq_click_day_code: iWpAppqClickDayCode;
    wp_appq_click_day_result: iWpAppqClickDayResult;
    wp_appq_click_day_setup: iWpAppqClickDaySetup;
    wp_appq_completed_tutorial: iWpAppqCompletedTutorial;
    wp_appq_contracts: iWpAppqContracts;
    wp_appq_course: iWpAppqCourse;
    wp_appq_course_answer: iWpAppqCourseAnswer;
    wp_appq_course_lesson: iWpAppqCourseLesson;
    wp_appq_course_question: iWpAppqCourseQuestion;
    wp_appq_course_tester_answer: iWpAppqCourseTesterAnswer;
    wp_appq_course_tester_answer_rev: iWpAppqCourseTesterAnswerRev;
    wp_appq_course_tester_certification: iWpAppqCourseTesterCertification;
    wp_appq_course_tester_status: iWpAppqCourseTesterStatus;
    wp_appq_cp_meta: iWpAppqCpMeta;
    wp_appq_cp_testbook: iWpAppqCpTestbook;
    wp_appq_cp_testbook_status: iWpAppqCpTestbookStatus;
    wp_appq_cp_testbook_step: iWpAppqCpTestbookStep;
    wp_appq_cron_jobs: iWpAppqCronJobs;
    wp_appq_custom_user_field: iWpAppqCustomUserField;
    wp_appq_custom_user_field_data: iWpAppqCustomUserFieldData;
    wp_appq_custom_user_field_dependencies: iWpAppqCustomUserFieldDependencies;
    wp_appq_custom_user_field_extras: iWpAppqCustomUserFieldExtras;
    wp_appq_custom_user_field_group_translation: iWpAppqCustomUserFieldGroupTranslation;
    wp_appq_custom_user_field_groups: iWpAppqCustomUserFieldGroups;
    wp_appq_custom_user_field_translation: iWpAppqCustomUserFieldTranslation;
    wp_appq_customer: iWpAppqCustomer;
    wp_appq_customer_account_invitations: iWpAppqCustomerAccountInvitations;
    wp_appq_education: iWpAppqEducation;
    wp_appq_employment: iWpAppqEmployment;
    wp_appq_entry_test_quiz: iWpAppqEntryTestQuiz;
    wp_appq_entry_test_responses: iWpAppqEntryTestResponses;
    wp_appq_entry_test_responses_rev: iWpAppqEntryTestResponsesRev;
    wp_appq_evd_apikey_credentials: iWpAppqEvdApikeyCredentials;
    wp_appq_evd_basic_credentials: iWpAppqEvdBasicCredentials;
    wp_appq_evd_bitbucket_settings: iWpAppqEvdBitbucketSettings;
    wp_appq_evd_bitbucket_sync: iWpAppqEvdBitbucketSync;
    wp_appq_evd_bug: iWpAppqEvdBug;
    wp_appq_evd_bug_media: iWpAppqEvdBugMedia;
    wp_appq_evd_bug_replicability: iWpAppqEvdBugReplicability;
    wp_appq_evd_bug_rev: iWpAppqEvdBugRev;
    wp_appq_evd_bug_status: iWpAppqEvdBugStatus;
    wp_appq_evd_bug_type: iWpAppqEvdBugType;
    wp_appq_evd_bugtracker_settings: iWpAppqEvdBugtrackerSettings;
    wp_appq_evd_bugtracker_sync: iWpAppqEvdBugtrackerSync;
    wp_appq_evd_campaign: iWpAppqEvdCampaign;
    wp_appq_evd_campaign_rev: iWpAppqEvdCampaignRev;
    wp_appq_evd_credentials: iWpAppqEvdCredentials;
    wp_appq_evd_jira_settings: iWpAppqEvdJiraSettings;
    wp_appq_evd_jira_sync: iWpAppqEvdJiraSync;
    wp_appq_evd_oauth1_credentials: iWpAppqEvdOauth1Credentials;
    wp_appq_evd_oauth2_credentials: iWpAppqEvdOauth2Credentials;
    wp_appq_evd_platform: iWpAppqEvdPlatform;
    wp_appq_evd_profile: iWpAppqEvdProfile;
    wp_appq_evd_redmine_settings: iWpAppqEvdRedmineSettings;
    wp_appq_evd_redmine_sync: iWpAppqEvdRedmineSync;
    wp_appq_evd_severity: iWpAppqEvdSeverity;
    wp_appq_event: iWpAppqEvent;
    wp_appq_event_transactional_mail: iWpAppqEventTransactionalMail;
    wp_appq_exp_points: iWpAppqExpPoints;
    wp_appq_facebook_leads_ads: iWpAppqFacebookLeadsAds;
    wp_appq_facebook_leads_import: iWpAppqFacebookLeadsImport;
    wp_appq_fiscal_profile: iWpAppqFiscalProfile;
    wp_appq_integration_center_bugs: iWpAppqIntegrationCenterBugs;
    wp_appq_integration_center_config: iWpAppqIntegrationCenterConfig;
    wp_appq_integration_center_custom_map: iWpAppqIntegrationCenterCustomMap;
    wp_appq_integration_center_integrations: iWpAppqIntegrationCenterIntegrations;
    wp_appq_lang: iWpAppqLang;
    wp_appq_lc_access: iWpAppqLcAccess;
    wp_appq_lc_manufacturer: iWpAppqLcManufacturer;
    wp_appq_lc_messages: iWpAppqLcMessages;
    wp_appq_lc_model: iWpAppqLcModel;
    wp_appq_lc_network: iWpAppqLcNetwork;
    wp_appq_lc_tasks: iWpAppqLcTasks;
    wp_appq_lc_view_meta: iWpAppqLcViewMeta;
    wp_appq_mi_request: iWpAppqMiRequest;
    wp_appq_olp_permissions: iWpAppqOlpPermissions;
    wp_appq_os: iWpAppqOs;
    wp_appq_payment: iWpAppqPayment;
    wp_appq_payment_request: iWpAppqPaymentRequest;
    wp_appq_payment_request_history: iWpAppqPaymentRequestHistory;
    wp_appq_payment_tw_quote: iWpAppqPaymentTwQuote;
    wp_appq_payment_tw_recipient: iWpAppqPaymentTwRecipient;
    wp_appq_payment_tw_transfer: iWpAppqPaymentTwTransfer;
    wp_appq_payment_work_types: iWpAppqPaymentWorkTypes;
    wp_appq_paypal_bulk_transaction: iWpAppqPaypalBulkTransaction;
    wp_appq_paypal_transaction: iWpAppqPaypalTransaction;
    wp_appq_platform: iWpAppqPlatform;
    wp_appq_popups: iWpAppqPopups;
    wp_appq_popups_read_status: iWpAppqPopupsReadStatus;
    wp_appq_profile_certifications: iWpAppqProfileCertifications;
    wp_appq_profile_edit_timestamp: iWpAppqProfileEditTimestamp;
    wp_appq_profile_has_lang: iWpAppqProfileHasLang;
    wp_appq_profile_skills: iWpAppqProfileSkills;
    wp_appq_profile_skills_src: iWpAppqProfileSkillsSrc;
    wp_appq_project: iWpAppqProject;
    wp_appq_prospect_payout: iWpAppqProspectPayout;
    wp_appq_quality_badge: iWpAppqQualityBadge;
    wp_appq_receipt: iWpAppqReceipt;
    wp_appq_referral_data: iWpAppqReferralData;
    wp_appq_report: iWpAppqReport;
    wp_appq_status_reason_text: iWpAppqStatusReasonText;
    wp_appq_status_reason_usage: iWpAppqStatusReasonUsage;
    wp_appq_task_additional_data: iWpAppqTaskAdditionalData;
    wp_appq_tester_jotform_submissions: iWpAppqTesterJotformSubmissions;
    wp_appq_ticket: iWpAppqTicket;
    wp_appq_unlayer_block_template: iWpAppqUnlayerBlockTemplate;
    wp_appq_unlayer_category: iWpAppqUnlayerCategory;
    wp_appq_unlayer_mail_template: iWpAppqUnlayerMailTemplate;
    wp_appq_uploaded_media: iWpAppqUploadedMedia;
    wp_appq_usecase_cluster: iWpAppqUsecaseCluster;
    wp_appq_usecase_media_observations: iWpAppqUsecaseMediaObservations;
    wp_appq_usecase_media_observations_tags: iWpAppqUsecaseMediaObservationsTags;
    wp_appq_usecase_media_observations_tags_link: iWpAppqUsecaseMediaObservationsTagsLink;
    wp_appq_usecase_media_read_status: iWpAppqUsecaseMediaReadStatus;
    wp_appq_usecase_media_share: iWpAppqUsecaseMediaShare;
    wp_appq_usecase_media_tag_type: iWpAppqUsecaseMediaTagType;
    wp_appq_user_deletion_reason: iWpAppqUserDeletionReason;
    wp_appq_user_task: iWpAppqUserTask;
    wp_appq_user_task_media: iWpAppqUserTaskMedia;
    wp_appq_user_to_customer: iWpAppqUserToCustomer;
    wp_appq_user_to_project: iWpAppqUserToProject;
    wp_cd_test_question: iWpCdTestQuestion;
    wp_cd_test_results: iWpCdTestResults;
    wp_cli_cookie_scan: iWpCliCookieScan;
    wp_cli_cookie_scan_categories: iWpCliCookieScanCategories;
    wp_cli_cookie_scan_cookies: iWpCliCookieScanCookies;
    wp_cli_cookie_scan_url: iWpCliCookieScanUrl;
    wp_cli_scripts: iWpCliScripts;
    wp_commentmeta: iWpCommentmeta;
    wp_comments: iWpComments;
    wp_crowd_appq_device: iWpCrowdAppqDevice;
    wp_crowd_appq_has_candidate: iWpCrowdAppqHasCandidate;
    wp_dc_appq_accepted_properties: iWpDcAppqAcceptedProperties;
    wp_dc_appq_api_have_scope: iWpDcAppqApiHaveScope;
    wp_dc_appq_api_keys: iWpDcAppqApiKeys;
    wp_dc_appq_api_scopes: iWpDcAppqApiScopes;
    wp_dc_appq_connector_settings: iWpDcAppqConnectorSettings;
    wp_dc_appq_devices: iWpDcAppqDevices;
    wp_dc_appq_plugin_sync: iWpDcAppqPluginSync;
    wp_forms_application: iWpFormsApplication;
    wp_links: iWpLinks;
    wp_options: iWpOptions;
    wp_postmeta: iWpPostmeta;
    wp_posts: iWpPosts;
    wp_redirection_404: iWpRedirection404;
    wp_redirection_groups: iWpRedirectionGroups;
    wp_redirection_items: iWpRedirectionItems;
    wp_redirection_logs: iWpRedirectionLogs;
    wp_signups: iWpSignups;
    wp_term_relationships: iWpTermRelationships;
    wp_term_taxonomy: iWpTermTaxonomy;
    wp_termmeta: iWpTermmeta;
    wp_terms: iWpTerms;
    wp_usermeta: iWpUsermeta;
    wp_users: iWpUsers;
    wp_wpmm_subscribers: iWpWpmmSubscribers;
    wp_yoast_indexable: iWpYoastIndexable;
    wp_yoast_indexable_hierarchy: iWpYoastIndexableHierarchy;
    wp_yoast_migrations: iWpYoastMigrations;
    wp_yoast_primary_term: iWpYoastPrimaryTerm;
    wp_yoast_seo_links: iWpYoastSeoLinks;
    wp_yoast_seo_meta: iWpYoastSeoMeta;
  }
}
