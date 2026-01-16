"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, FileText, Calendar } from "lucide-react"

export function ContentManagement() {
  // Mock content data
  const content = [
    {
      id: "1",
      title: "Welcome to Hi Studio",
      content_type: "page",
      slug: "welcome",
      is_published: true,
      publish_date: "2024-01-15",
      author: "Admin User",
      view_count: 1247,
      last_updated: "2024-03-10",
    },
    {
      id: "2",
      title: "Our Wellness Method",
      content_type: "page",
      slug: "method",
      is_published: true,
      publish_date: "2024-01-20",
      author: "Admin User",
      view_count: 892,
      last_updated: "2024-02-15",
    },
    {
      id: "3",
      title: "Spring Wellness Challenge",
      content_type: "blog_post",
      slug: "spring-wellness-challenge",
      is_published: true,
      publish_date: "2024-03-01",
      author: "Sarah Johnson",
      view_count: 456,
      last_updated: "2024-03-01",
    },
    {
      id: "4",
      title: "New Class Schedule Updates",
      content_type: "announcement",
      slug: "schedule-updates",
      is_published: false,
      publish_date: null,
      author: "Admin User",
      view_count: 0,
      last_updated: "2024-03-12",
    },
  ]

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case "page":
        return <Badge className="bg-blue-100 text-blue-800">Page</Badge>
      case "blog_post":
        return <Badge className="bg-green-100 text-green-800">Blog Post</Badge>
      case "announcement":
        return <Badge className="bg-purple-100 text-purple-800">Announcement</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge className="bg-green-100 text-green-800">Published</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage your website content, pages, and blog posts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Content</p>
                <p className="text-2xl font-bold">{content.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-2xl font-bold">{content.filter((c) => c.is_published).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Drafts</p>
                <p className="text-2xl font-bold">{content.filter((c) => !c.is_published).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold">
                  {content.reduce((sum, c) => sum + c.view_count, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
          <CardDescription>Manage your website pages, blog posts, and announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">/{item.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getContentTypeBadge(item.content_type)}</TableCell>
                  <TableCell>{getStatusBadge(item.is_published)}</TableCell>
                  <TableCell>
                    <p className="text-sm">{item.author}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.view_count.toLocaleString()}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.publish_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.publish_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not published</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.last_updated).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
