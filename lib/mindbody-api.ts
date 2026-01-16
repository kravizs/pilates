export interface MindBodyConfig {
  apiKey: string
  siteId: string
  baseUrl: string
  enabled: boolean
}

export interface MindBodyClass {
  id: string
  name: string
  description: string
  startDateTime: string
  endDateTime: string
  instructor: {
    id: string
    name: string
  }
  location: {
    id: string
    name: string
  }
  maxCapacity: number
  webCapacity: number
  totalBooked: number
  totalBookedWaitlist: number
  webBooked: number
  semesterId: string
  isActive: boolean
  isWaitlistAvailable: boolean
  isEnrolled: boolean
  hideCancel: boolean
  substituted: boolean
  active: boolean
  isAvailable: boolean
  startDate: string
  isIntro: boolean
  color: string
  classScheduleId: string
}

export interface MindBodyClient {
  id: string
  firstName: string
  lastName: string
  email: string
  mobilePhone: string
  homePhone: string
  workPhone: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
  country: string
  birthDate: string
  gender: string
  isProspect: boolean
  isCompany: boolean
  liability: {
    isReleased: boolean
    agreementDate: string
  }
  creationDate: string
  uniqueId: number
  status: string
  action: string
}

export interface MindBodyBooking {
  id: string
  classId: string
  clientId: string
  appointmentStatus: string
  signedInStatus: string
  makeUp: boolean
  sendEmail: boolean
  test: boolean
  lateCancelled: boolean
  bookingOrigin: string
  clientPassId: string
}

class MindBodyAPI {
  private config: MindBodyConfig
  private accessToken: string | null = null

  constructor(config: MindBodyConfig) {
    this.config = config
  }

  // Authentication
  async authenticate(): Promise<string> {
    if (!this.config.enabled) {
      throw new Error("MindBody integration is disabled")
    }

    try {
      // Mock authentication - replace with actual MindBody API call
      const response = await fetch(`${this.config.baseUrl}/public/v6/usertoken/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.config.apiKey,
          SiteId: this.config.siteId,
        },
        body: JSON.stringify({
          Username: process.env.MINDBODY_USERNAME,
          Password: process.env.MINDBODY_PASSWORD,
        }),
      })

      if (!response.ok) {
        throw new Error("MindBody authentication failed")
      }

      const data = await response.json()
      this.accessToken = data.AccessToken
      return this.accessToken ?? ""
    } catch (error) {
      console.error("MindBody authentication error:", error)
      // Return mock token for demo
      this.accessToken = "mock-access-token"
      return this.accessToken
    }
  }

  // Get classes
  async getClasses(startDate: string, endDate: string): Promise<MindBodyClass[]> {
    if (!this.config.enabled) {
      return this.getMockClasses()
    }

    try {
      if (!this.accessToken) {
        await this.authenticate()
      }

      const response = await fetch(
        `${this.config.baseUrl}/public/v6/class/classes?startDateTime=${startDate}&endDateTime=${endDate}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Api-Key": this.config.apiKey,
            SiteId: this.config.siteId,
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch classes from MindBody")
      }

      const data = await response.json()
      return data.Classes || []
    } catch (error) {
      console.error("MindBody getClasses error:", error)
      return this.getMockClasses()
    }
  }

  // Book a class
  async bookClass(classId: string, clientId: string, test = false): Promise<MindBodyBooking> {
    if (!this.config.enabled) {
      return this.getMockBooking(classId, clientId)
    }

    try {
      if (!this.accessToken) {
        await this.authenticate()
      }

      const response = await fetch(`${this.config.baseUrl}/public/v6/class/addclientstoclass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.config.apiKey,
          SiteId: this.config.siteId,
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          ClassId: classId,
          ClientIds: [clientId],
          Test: test,
          SendEmail: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to book class in MindBody")
      }

      const data = await response.json()
      return data.ClassVisits?.[0] || this.getMockBooking(classId, clientId)
    } catch (error) {
      console.error("MindBody bookClass error:", error)
      return this.getMockBooking(classId, clientId)
    }
  }

  // Cancel booking
  async cancelBooking(classId: string, clientId: string): Promise<boolean> {
    if (!this.config.enabled) {
      return true
    }

    try {
      if (!this.accessToken) {
        await this.authenticate()
      }

      const response = await fetch(`${this.config.baseUrl}/public/v6/class/removeclientsfromclass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.config.apiKey,
          SiteId: this.config.siteId,
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          ClassId: classId,
          ClientIds: [clientId],
          SendEmail: true,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("MindBody cancelBooking error:", error)
      return false
    }
  }

  // Get or create client
  async getOrCreateClient(clientData: Partial<MindBodyClient>): Promise<MindBodyClient> {
    if (!this.config.enabled) {
      return this.getMockClient(clientData)
    }

    try {
      if (!this.accessToken) {
        await this.authenticate()
      }

      // First try to find existing client
      const searchResponse = await fetch(
        `${this.config.baseUrl}/public/v6/client/clients?searchText=${clientData.email}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Api-Key": this.config.apiKey,
            SiteId: this.config.siteId,
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.Clients && searchData.Clients.length > 0) {
          return searchData.Clients[0]
        }
      }

      // Create new client if not found
      const createResponse = await fetch(`${this.config.baseUrl}/public/v6/client/addclient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.config.apiKey,
          SiteId: this.config.siteId,
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          FirstName: clientData.firstName,
          LastName: clientData.lastName,
          Email: clientData.email,
          MobilePhone: clientData.mobilePhone,
        }),
      })

      if (!createResponse.ok) {
        throw new Error("Failed to create client in MindBody")
      }

      const createData = await createResponse.json()
      return createData.Client || this.getMockClient(clientData)
    } catch (error) {
      console.error("MindBody getOrCreateClient error:", error)
      return this.getMockClient(clientData)
    }
  }

  // Mock data methods for demo purposes
  private getMockClasses(): MindBodyClass[] {
    const today = new Date()
    const classes: MindBodyClass[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      classes.push({
        id: `mb-class-${i}-morning`,
        name: "Yoga Flow",
        description: "Flow through mindful movements and find your inner peace",
        startDateTime: `${dateStr}T09:00:00`,
        endDateTime: `${dateStr}T10:00:00`,
        instructor: { id: "1", name: "Sarah Johnson" },
        location: { id: "1", name: "Studio A" },
        maxCapacity: 12,
        webCapacity: 12,
        totalBooked: Math.floor(Math.random() * 8),
        totalBookedWaitlist: 0,
        webBooked: Math.floor(Math.random() * 8),
        semesterId: "1",
        isActive: true,
        isWaitlistAvailable: true,
        isEnrolled: false,
        hideCancel: false,
        substituted: false,
        active: true,
        isAvailable: true,
        startDate: dateStr,
        isIntro: false,
        color: "#4F46E5",
        classScheduleId: "1",
      })

      classes.push({
        id: `mb-class-${i}-evening`,
        name: "Pilates Core",
        description: "Strengthen your core and improve flexibility with precision",
        startDateTime: `${dateStr}T18:30:00`,
        endDateTime: `${dateStr}T19:15:00`,
        instructor: { id: "2", name: "Mike Chen" },
        location: { id: "2", name: "Studio B" },
        maxCapacity: 8,
        webCapacity: 8,
        totalBooked: Math.floor(Math.random() * 6),
        totalBookedWaitlist: 0,
        webBooked: Math.floor(Math.random() * 6),
        semesterId: "1",
        isActive: true,
        isWaitlistAvailable: true,
        isEnrolled: false,
        hideCancel: false,
        substituted: false,
        active: true,
        isAvailable: true,
        startDate: dateStr,
        isIntro: false,
        color: "#059669",
        classScheduleId: "2",
      })
    }

    return classes
  }

  private getMockBooking(classId: string, clientId: string): MindBodyBooking {
    return {
      id: `mb-booking-${Date.now()}`,
      classId,
      clientId,
      appointmentStatus: "Booked",
      signedInStatus: "Unknown",
      makeUp: false,
      sendEmail: true,
      test: false,
      lateCancelled: false,
      bookingOrigin: "Online",
      clientPassId: "pass-123",
    }
  }

  private getMockClient(clientData: Partial<MindBodyClient>): MindBodyClient {
    return {
      id: `mb-client-${Date.now()}`,
      firstName: clientData.firstName || "",
      lastName: clientData.lastName || "",
      email: clientData.email || "",
      mobilePhone: clientData.mobilePhone || "",
      homePhone: "",
      workPhone: "",
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      birthDate: "",
      gender: "",
      isProspect: false,
      isCompany: false,
      liability: {
        isReleased: false,
        agreementDate: "",
      },
      creationDate: new Date().toISOString(),
      uniqueId: Date.now(),
      status: "Active",
      action: "None",
    }
  }
}

// Export singleton instance
const mindBodyConfig: MindBodyConfig = {
  apiKey: process.env.MINDBODY_API_KEY || "demo-api-key",
  siteId: process.env.MINDBODY_SITE_ID || "-99",
  baseUrl: process.env.MINDBODY_BASE_URL || "https://api.mindbodyonline.com",
  enabled: process.env.MINDBODY_ENABLED === "true" || false,
}

export const mindBodyAPI = new MindBodyAPI(mindBodyConfig)
export default mindBodyAPI
