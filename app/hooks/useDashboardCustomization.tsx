import React, { useEffect, useState } from "react";
import { CustomDashboardPanel, VeraxPanel } from "../components/VeraxPanel";
import { TestingPanel } from "../components/TestingPanel";
import { setCustomizationTheme } from "../utils/theme/setCustomizationTheme";
import { CustomizationTheme } from "../utils/theme/types";

const requestDynamicCustomizationConfig = async (
  customizationKey: string
): Promise<DynamicCustomization | undefined> => {
  // TODO Replace this with a call to the API

  if (customizationKey === "custom") {
    return {
      useCustomDashboardPanel: true,
      dashboardPanel: {
        logo: {
          image: "ABC",
          caption: "Custom",
        },
        body: {
          heading: "Custom",
          text: "This is a custom panel",
        },
      },
      customizationTheme: {
        colors: {
          customizationBackground1: "00 110 00",
        },
      },
    };
  }
};

type BasicCustomization = {
  customizationTheme?: CustomizationTheme;
  useCustomDashboardPanel: boolean;
  customizationEnabled?: boolean;
};

type DynamicCustomization = BasicCustomization & {
  dashboardPanel: {
    logo: {
      image: React.ReactNode;
      caption: string;
    };
    body: {
      heading: string;
      text: string;
    };
  };
};

type Customization = BasicCustomization | DynamicCustomization;

const isDynamicCustomization = (config: Customization): config is DynamicCustomization => {
  return (config as DynamicCustomization).dashboardPanel !== undefined;
};

export const DynamicCustomDashboardPanel = ({
  className,
  config,
  customizationKey,
}: {
  className: string;
  config: Customization;
  customizationKey?: string;
}) => {
  // First, check to see if the customization key is one of the built-in ones
  switch (customizationKey) {
    case "testing":
      return <TestingPanel className={className} />;
    case "verax":
      return <VeraxPanel className={className} />;
    default:
      // If there is no customization key, return an empty div
      if (!customizationKey || !isDynamicCustomization(config)) {
        return <div></div>;
      }
  }

  // Otherwise, it's a dynamically defined panel

  const { logo, body } = config.dashboardPanel;

  return (
    <CustomDashboardPanel className={className} logo={logo}>
      <div className="font-heading text-lg">{body.heading}</div>
      <div>{body.text}</div>
    </CustomDashboardPanel>
  );
};

const loadConfigForCustomizationKey = async (customizationKey?: string): Promise<Customization> => {
  let config: Customization = {
    customizationEnabled: false,
    useCustomDashboardPanel: false,
  };

  switch (customizationKey) {
    case "testing":
      config = {
        customizationEnabled: true,
        useCustomDashboardPanel: true,
        customizationTheme: {
          colors: {
            customizationBackground1: "var(--color-focus)",
          },
        },
      };
      break;
    case "verax":
      config = {
        customizationEnabled: true,
        useCustomDashboardPanel: true,
        customizationTheme: {
          colors: {
            customizationBackground1: "var(--color-foreground-7)",
          },
        },
      };
      break;
    default:
      if (customizationKey) {
        const dynamicConfig = await requestDynamicCustomizationConfig(customizationKey);
        if (dynamicConfig) {
          config = dynamicConfig;
        }
      }
  }

  return config;
};

export const useDashboardCustomization = (customizationKey?: string): Customization => {
  const [customizationConfiguration, setCustomizationConfiguration] = useState<Customization>({
    customizationEnabled: false,
    useCustomDashboardPanel: false,
  });

  useEffect(() => {
    (async () => {
      if (customizationKey) {
        const config = await loadConfigForCustomizationKey(customizationKey);
        setCustomizationConfiguration(config);
        if (config.customizationTheme) {
          setCustomizationTheme(config.customizationTheme);
        }
      }
    })();
  }, [customizationKey]);

  return customizationConfiguration;
};
