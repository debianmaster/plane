/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { isEmpty } from "lodash-es";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Monitor } from "lucide-react";
// plane internal packages
import { API_BASE_URL } from "@plane/constants";
import { Button } from "@makeplane/propel/components/button";
import { TOAST_TYPE, setToast } from "@/providers/toast";
import type { IFormattedInstanceConfiguration, TInstanceMicrosoftAuthenticationConfigurationKeys } from "@plane/types";
// components
import { CodeBlock } from "@/components/common/code-block";
import { ConfirmDiscardModal } from "@/components/common/confirm-discard-modal";
import type { TControllerInputFormField } from "@/components/common/controller-input";
import type { TControllerSwitchFormField } from "@/components/common/controller-switch";
import { ControllerSwitch } from "@/components/common/controller-switch";
import { ControllerInput } from "@/components/common/controller-input";
import type { TCopyField } from "@/components/common/copy-field";
import { CopyField } from "@/components/common/copy-field";
// hooks
import { useInstance } from "@/hooks/store";

type Props = {
  config: IFormattedInstanceConfiguration;
};

type MicrosoftConfigFormValues = Record<TInstanceMicrosoftAuthenticationConfigurationKeys, string>;

export function InstanceMicrosoftConfigForm(props: Props) {
  const { config } = props;
  // states
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false);
  // store hooks
  const { updateInstanceConfigurations } = useInstance();
  // form data
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<MicrosoftConfigFormValues>({
    defaultValues: {
      MICROSOFT_CLIENT_ID: config["MICROSOFT_CLIENT_ID"],
      MICROSOFT_CLIENT_SECRET: config["MICROSOFT_CLIENT_SECRET"],
      MICROSOFT_TENANT_ID: config["MICROSOFT_TENANT_ID"] || "common",
      ENABLE_MICROSOFT_SYNC: config["ENABLE_MICROSOFT_SYNC"] || "0",
    },
  });

  const originURL = !isEmpty(API_BASE_URL) ? API_BASE_URL : typeof window !== "undefined" ? window.location.origin : "";

  const MICROSOFT_FORM_FIELDS: TControllerInputFormField<MicrosoftConfigFormValues>[] = [
    {
      key: "MICROSOFT_CLIENT_ID",
      type: "text",
      label: "Application (client) ID",
      description: (
        <>
          Your Application (client) ID from the Microsoft Azure portal.{" "}
          <a
            tabIndex={-1}
            href="https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            Learn more
          </a>
        </>
      ),
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      error: Boolean(errors.MICROSOFT_CLIENT_ID),
      required: true,
    },
    {
      key: "MICROSOFT_CLIENT_SECRET",
      type: "password",
      label: "Client secret",
      description: (
        <>
          Your client secret value from the Microsoft Azure portal Certificates & secrets page.{" "}
          <a
            tabIndex={-1}
            href="https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app#add-a-client-secret"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            Learn more
          </a>
        </>
      ),
      placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      error: Boolean(errors.MICROSOFT_CLIENT_SECRET),
      required: true,
    },
    {
      key: "MICROSOFT_TENANT_ID",
      type: "text",
      label: "Directory (tenant) ID",
      description: (
        <>
          Your Directory (tenant) ID from the Azure portal. Use &quot;common&quot; for multi-tenant apps.{" "}
          <a
            tabIndex={-1}
            href="https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            Learn more
          </a>
        </>
      ),
      placeholder: "common",
      error: Boolean(errors.MICROSOFT_TENANT_ID),
      required: false,
    },
  ];

  const MICROSOFT_FORM_SWITCH_FIELD: TControllerSwitchFormField<MicrosoftConfigFormValues> = {
    name: "ENABLE_MICROSOFT_SYNC",
    label: "Microsoft",
  };

  const MICROSOFT_SERVICE_DETAILS: TCopyField[] = [
    {
      key: "Callback_URI",
      label: "Redirect URI",
      url: `${originURL}/auth/microsoft/callback/`,
      description: (
        <p>
          We will auto-generate this. Paste this into your <CodeBlock darkerShade>Redirect URI</CodeBlock> field in your
          Azure app registration under Authentication.
        </p>
      ),
    },
  ];

  const onSubmit = async (formData: MicrosoftConfigFormValues) => {
    const payload: Partial<MicrosoftConfigFormValues> = { ...formData };

    try {
      const response = await updateInstanceConfigurations(payload);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Done!",
        message: "Your Microsoft authentication is configured. You should test it now.",
      });
      reset({
        MICROSOFT_CLIENT_ID: response.find((item) => item.key === "MICROSOFT_CLIENT_ID")?.value,
        MICROSOFT_CLIENT_SECRET: response.find((item) => item.key === "MICROSOFT_CLIENT_SECRET")?.value,
        MICROSOFT_TENANT_ID: response.find((item) => item.key === "MICROSOFT_TENANT_ID")?.value,
        ENABLE_MICROSOFT_SYNC: response.find((item) => item.key === "ENABLE_MICROSOFT_SYNC")?.value,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isDirty) {
      e.preventDefault();
      setIsDiscardChangesModalOpen(true);
    }
  };

  return (
    <>
      <ConfirmDiscardModal
        isOpen={isDiscardChangesModalOpen}
        onDiscardHref="/authentication"
        handleClose={() => setIsDiscardChangesModalOpen(false)}
      />
      <div className="flex flex-col gap-8">
        <div className="grid w-full grid-cols-2 gap-x-12 gap-y-8">
          <div className="col-span-2 flex flex-col gap-y-4 pt-1 md:col-span-1">
            <div className="pt-2.5 text-18 font-medium">Microsoft-provided details for Plane</div>
            {MICROSOFT_FORM_FIELDS.map((field) => (
              <ControllerInput
                key={field.key}
                control={control}
                type={field.type}
                name={field.key}
                label={field.label}
                description={field.description}
                placeholder={field.placeholder}
                error={field.error}
                required={field.required}
              />
            ))}
            <ControllerSwitch control={control} field={MICROSOFT_FORM_SWITCH_FIELD} />
            <div className="flex flex-col gap-1 pt-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="primary"
                  size="md"
                  stretch="auto"
                  onClick={(e) => void handleSubmit(onSubmit)(e)}
                  loading={isSubmitting}
                  disabled={!isDirty}
                  label={isSubmitting ? "Saving" : "Save changes"}
                />
                <Button
                  variant="secondary"
                  size="md"
                  stretch="auto"
                  nativeButton={false}
                  render={<Link href="/authentication" onClick={handleGoBack} />}
                  label="Go back"
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-y-6 md:col-span-1">
            <div className="pt-2 text-18 font-medium">Plane-provided details for Microsoft</div>

            <div className="flex flex-col gap-y-4">
              {/* web service details */}
              <div className="flex flex-col overflow-hidden rounded-lg">
                <div className="flex items-center gap-x-3 bg-layer-3 px-6 py-3 text-11 font-medium text-secondary uppercase">
                  <Monitor className="h-3 w-3" />
                  Web
                </div>
                <div className="flex flex-col gap-y-4 bg-layer-1 px-6 py-4">
                  {MICROSOFT_SERVICE_DETAILS.map((field) => (
                    <CopyField key={field.key} label={field.label} url={field.url} description={field.description} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
