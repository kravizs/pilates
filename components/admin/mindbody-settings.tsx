"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mindBodyAPI } from "@/lib/mindbody-api"
import { Settings, CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react"

export function MindBodySettings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [siteId, setSiteId] = useState("")
  const [baseUrl, setBaseUrl] = useState("https://api.mindbodyonline.com")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [lastSync, setLastSync] = useState<string | null>(null)

  const handleTestConnection = async () => {
    setIsConnecting(true)
    try {
      await mindBodyAPI.authenticate()
      setConnectionStatus("connected")
      setLastSync(new Date().toISOString())
    } catch (error) {
      setConnectionStatus("error")
      console.error("MindBody connection test failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSyncClasses = async () => {
    setIsConnecting(true)
    try {
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 30)

      const startDateStr = today.toISOString().split("T")[0]
      const endDateStr = endDate.toISOString().split("T")[0]

      await mindBodyAPI.getClasses(startDateStr, endDateStr)
      setLastSync(new Date().toISOString())
    } catch (error) {
      console.error("MindBody sync failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">MindBody Integration</h2>
        <p className="text-muted-foreground">Configure your MindBody Online integration settings</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>Current status of your MindBody integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Integration Status</p>
              <p className="text-sm text-muted-foreground">
                {isEnabled ? "MindBody integration is enabled" : "MindBody integration is disabled"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
          </div>

          {lastSync && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Last sync: {new Date(lastSync).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Configure your MindBody API credentials and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your MindBody API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-id">Site ID</Label>
              <Input
                id="site-id"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                placeholder="Enter your MindBody Site ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.mindbodyonline.com"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTestConnection} disabled={isConnecting || !isEnabled}>
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button variant="outline" asChild>
              <a href="https://developers.mindbodyonline.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                MindBody Developers
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Synchronization</CardTitle>
          <CardDescription>Manage data synchronization between Hi Studio and MindBody</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-sync Classes</p>
                <p className="text-sm text-muted-foreground">Automatically sync class schedules every hour</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sync Client Data</p>
                <p className="text-sm text-muted-foreground">Synchronize client information between systems</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Real-time Bookings</p>
                <p className="text-sm text-muted-foreground">Process bookings through MindBody in real-time</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleSyncClasses} disabled={isConnecting || !isEnabled}>
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Now"
              )}
            </Button>
            <Button variant="outline">View Sync Logs</Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Features */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Features</CardTitle>
          <CardDescription>Available features with MindBody integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✓ Available Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time class scheduling</li>
                <li>• Automated booking management</li>
                <li>• Client data synchronization</li>
                <li>• Payment processing integration</li>
                <li>• Waitlist management</li>
                <li>• Instructor scheduling</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">ℹ Integration Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unified booking experience</li>
                <li>• Reduced double bookings</li>
                <li>• Automated email confirmations</li>
                <li>• Advanced reporting & analytics</li>
                <li>• Mobile app compatibility</li>
                <li>• Multi-location support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
