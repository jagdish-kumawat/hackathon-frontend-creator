"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { userApi } from "@/lib/user-api";
import { UpdateCurrentUserRequest } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { logger } from "@/lib/logger";

interface UserProfileProps {
  className?: string;
  showAdvancedInfo?: boolean; // Only show in development
}

export function UserProfile({
  className,
  showAdvancedInfo = false,
}: UserProfileProps) {
  const { userProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
  });

  const handleEdit = () => {
    setFormData({
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
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
      logger.info("User profile updated successfully");
    } catch (error) {
      logger.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">Loading user profile...</div>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                {userProfile.firstName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                {userProfile.lastName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">
              {userProfile.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">
              {userProfile.fullName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span
                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  userProfile.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {userProfile.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Member Since
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">
              {new Date(userProfile.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Advanced info only shown in development or when explicitly requested */}
          {showAdvancedInfo && process.env.NODE_ENV === "development" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 font-mono text-xs">
                  {userProfile.id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Updated
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">
                  {new Date(userProfile.updatedAt).toLocaleString()}
                </div>
              </div>
            </>
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
