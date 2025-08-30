"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { userApi } from "@/lib/user-api";
import { UpdateCurrentUserRequest } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const { user, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });

  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("First name and last name are required");
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateCurrentUserRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      await userApi.updateCurrentUser(updateData);
      await refreshUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          No user profile available
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">User Profile</h3>
          {!isEditing && (
            <Button onClick={handleEdit} variant="outline" size="sm">
              Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md">
                {user.firstName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md">
                {user.lastName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-600">
              {user.username}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-600">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-600">
              {user.fullName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roles
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md">
              <div className="flex flex-wrap gap-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {user.tenantId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant ID
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-600">
                {user.tenantId}
              </div>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={handleCancel} variant="outline" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
