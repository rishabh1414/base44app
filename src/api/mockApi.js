// src/api/mockApi.js

// Mock data - in a real application, this would come from your backend.
const mockData = {
  user: { id: "1", email: "user@example.com", role: "admin" },
  userSecurity: { compliance_level: "HIPAA" },
  conversations: [{ id: "1", messages: [] }],
  directors: [
    {
      id: "1",
      name: "Director",
      role: "Business Operations Director",
      managers: [],
    },
  ],
  managers: [
    {
      id: "1",
      name: "Manager",
      specialization: "Project Management",
      agents: [],
    },
  ],
  agents: [{ id: "1", name: "Agent", manager_id: "1" }],
  tasks: [],
  contacts: [],
  contentCalendar: [],
  agencyBranding: [{ agency_name: "My Agency" }],
  subscriptions: [
    {
      id: "1",
      plan_name: "professional",
      amount: 149,
      status: "active",
      current_period_end: new Date(),
    },
  ],
  paymentMethods: [],
  powerUps: [],
  integrations: [],
  userIntegrations: [],
  auditLog: [],
};

// Mock API functions
export const mockApi = {
  auth: {
    me: async () => mockData.user,
  },
  entities: {
    UserSecurity: {
      filter: async () => [mockData.userSecurity],
    },
    Conversation: {
      list: async () => mockData.conversations,
      create: async (data) => ({ ...data, id: Math.random().toString() }),
      update: async (id, data) => ({ ...data, id }),
    },
    Director: {
      filter: async () => mockData.directors,
    },
    Manager: {
      filter: async () => mockData.managers,
    },
    Agent: {
      filter: async () => mockData.agents,
    },
    Task: {
      create: async (data) => ({ ...data, id: Math.random().toString() }),
      update: async (id, data) => ({ ...data, id }),
      list: async () => mockData.tasks,
    },
    Contact: {
      list: async () => mockData.contacts,
      create: async (data) => ({ ...data, id: Math.random().toString() }),
      update: async (id, data) => ({ ...data, id }),
      delete: async (id) => ({ id }),
    },
    ContentCalendar: {
      list: async () => mockData.contentCalendar,
    },
    AgencyBranding: {
      filter: async () => mockData.agencyBranding,
      list: async () => mockData.agencyBranding,
      create: async (data) => ({ ...data, id: Math.random().toString() }),
      update: async (id, data) => ({ ...data, id }),
    },
    Subscription: {
      filter: async () => mockData.subscriptions,
      list: async () => mockData.subscriptions,
      create: async (data) => ({ ...data, id: Math.random().toString() }),
      update: async (id, data) => ({ ...data, id }),
    },
    PaymentMethod: {
      filter: async () => mockData.paymentMethods,
      list: async () => mockData.paymentMethods,
    },
    PowerUp: {
      filter: async () => mockData.powerUps,
    },
    Integration: {
      filter: async () => mockData.integrations,
    },
    UserIntegration: {
      filter: async () => mockData.userIntegrations,
      create: async (data) => ({ ...data, id: Math.random().toString() }),
    },
    AuditLog: {
      create: async (data) => ({ ...data, id: Math.random().toString() }),
    },
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt }) => `This is a mock response to: ${prompt}`,
      UploadFile: async ({ file }) => ({
        file_url: "https://example.com/mock-file.png",
      }),
      GenerateImage: async ({ prompt }) => ({
        url: "https://example.com/mock-image.png",
      }),
    },
  },
};
