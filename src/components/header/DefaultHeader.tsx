import { useContext, useState } from "react";
import { BrandingContext } from "../../tenant/BrandingContext";
import { AuthContext } from "../../auth/AuthContext";

import {
  IconBook,
  IconChartPie3,
  IconChevronDown,
  IconCode,
  IconCoin,
  IconFingerprint,
  IconNotification,
  IconHeart,
  IconLogout,
  IconMessage,
  IconPlayerPause,
  IconSettings,
  IconStar,
  IconSwitchHorizontal,
  IconTrash,
} from '@tabler/icons-react';
import {
  Anchor,
  Avatar,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  Menu,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../stylings/HeaderStyling.module.css';
import cx from 'clsx';

const mockdata = [
  {
    icon: IconCode,
    title: 'Open source',
    description: 'This Pokémon’s cry is very loud and distracting',
  },
  {
    icon: IconCoin,
    title: 'Free for everyone',
    description: 'The fluid of Smeargle’s tail secretions changes',
  },
  {
    icon: IconBook,
    title: 'Documentation',
    description: 'Yanma is capable of seeing 360 degrees without',
  },
  {
    icon: IconFingerprint,
    title: 'Security',
    description: 'The shell’s rounded shape and the grooves on its.',
  },
  {
    icon: IconChartPie3,
    title: 'Analytics',
    description: 'This Pokémon uses its flying ability to quickly chase',
  },
  {
    icon: IconNotification,
    title: 'Notifications',
    description: 'Combusken battles with the intensely hot flames it spews',
  },
];


export const DefaultHeader = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const theme = useMantineTheme();
  const { branding } = useContext(BrandingContext);
  const [userMenuOpened, { toggle: toggleUserMenu, close: closeUserMenu }] = useDisclosure(false);
  const { user } = useContext(AuthContext);
  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon size={22} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  const drawerLinks = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title} fz="sm" p="xs">
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon size={22} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  function getContrastColor(hex: string): string {
    // substring(start, end) statt substr(start, length)
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 160 ? 'black' : 'white';
  }
  if (!theme || !theme.colors.primary || !theme.colors.primary[6]) return null;
  const bgColor = theme.colors.primary[6];
  const textColor = getContrastColor(bgColor);
  const initials = `${
    user?.employeeFirstname?.[0] ?? 'V'
  }${user?.employeeSurname?.[0] ?? 'N'}`;

  return (
    <Box pb={120}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
            {branding?.logoSrc ? (
                <img
                    src={branding.logoSrc}
                    alt="Logo"
                    style={{ height: 40 }}
                />
            ) : (
                <Text fw={700} style={{ color: textColor }}>GriangApp</Text>
            )}

          <Group h="100%" gap={0} visibleFrom="md">
            <a href="#" className={classes.link} style={{ color: textColor }}>
              Home
            </a>
            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline style={{ backgroundColor: 'transparent' }}>
                    <Box component="span" mr={5} style={{ color: textColor, backgroundColor: 'transparent'}}>
                      Zeiterfassung
                    </Box>
                    <IconChevronDown size={16} color={theme.colors.background[0]} style={{ backgroundColor: 'transparent' }} />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Features</Text>
                  <Anchor href="#" fz="xs">
                    View all
                  </Anchor>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} fz="sm">
                        Get started
                      </Text>
                      <Text size="xs" c="dimmed">
                        Their food sources have decreased, and their numbers
                      </Text>
                    </div>
                    <Button variant="default">Get started</Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>
            <a href="#" className={classes.link} style={{ color: textColor }}>
              Benutzerverwaltung
            </a>
            <a href="#" className={classes.link} style={{ color: textColor }}>
              Wunsch?
            </a>
          </Group>
          <Box visibleFrom="xs">
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => closeUserMenu()}
              onOpen={() => toggleUserMenu()}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                  visibleFrom="md"
                >
                  <Group gap={7}>
                    <Avatar color={theme.colors.background[0]} radius="xl" size={40}>
                      {initials.toUpperCase()}
                    </Avatar>
                    <Text fw={500} size="sm" lh={1} mr={3} style={{ color: textColor }}>
                      {user?.employeeSurname ?? 'Nachname'}, {user?.employeeFirstname ?? 'Vorname'}
                    </Text>
                    <IconChevronDown size={12} stroke={4.5} style={{ color: textColor }} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconHeart size={16} color={theme.colors.red[6]} stroke={1.5} />}
                >
                  Liked posts
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconStar size={16} color={theme.colors.yellow[6]} stroke={1.5} />}
                >
                  Saved posts
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMessage size={16} color={theme.colors.blue[6]} stroke={1.5} />}
                >
                  Your comments
                </Menu.Item>

                <Menu.Label>Settings</Menu.Label>
                <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                  Account settings
                </Menu.Item>
                <Menu.Item leftSection={<IconSwitchHorizontal size={16} stroke={1.5} />}>
                  Change account
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />}>Logout</Menu.Item>

                <Menu.Divider />

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item leftSection={<IconPlayerPause size={16} stroke={1.5} />}>
                  Pause subscription
                </Menu.Item>
                <Menu.Item color="red" leftSection={<IconTrash size={16} stroke={1.5} />}>
                  Delete account
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="md"
            aria-label="Toggle navigation"
            color={textColor}
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />

          <a href="#" className={classes.drawerLink}>
            Home
          </a>
          <UnstyledButton 
            className={classes.drawerLink} 
            onClick={toggleLinks}
            fz="sm"
            p="md"
            >
            <Center inline>
              <Box component="span" mr={5}>
                Zeiterfassung
              </Box>
              <IconChevronDown size={16} color={theme.colors.background[10]} style={{ backgroundColor: 'transparent' }} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{drawerLinks}</Collapse>
          <a href="#" className={classes.drawerLink}>
            Benutzerverwaltung
          </a>
          <a href="#" className={classes.drawerLink}>
            Wunsch?
          </a>

          <Divider my="sm" />

          <UnstyledButton
            className={classes.drawerLink}
            onClick={toggleUserMenu}
            fz="sm"
            px="md"
          >
            <Center inline>
              <Avatar
                radius="xl"
                size={32}
                styles={{
                  root: { backgroundColor: 'var(--mantine-color-primary-6)' },
                  placeholder: { color: 'white' }
                }}
              >
                {initials.toUpperCase()}
              </Avatar>
              <Box component="span" mr={5} style={{ paddingLeft: 'calc(var(--mantine-spacing-md)/2)' }}>
                {user?.employeeSurname ?? 'Nachname'}, {user?.employeeFirstname ?? 'Vorname'}
              </Box>
              <IconChevronDown size={16} />
            </Center>
          </UnstyledButton>

          <Collapse in={userMenuOpened}>
            <a href="#" className={classes.drawerLink} style={{ paddingLeft: 'calc(var(--mantine-spacing-md) * 2)' }}>Account settings</a>
            <a href="#" className={classes.drawerLink} style={{ paddingLeft: 'calc(var(--mantine-spacing-md) * 2)' }}>Change account</a>
            <a href="#" className={classes.drawerLink} style={{ paddingLeft: 'calc(var(--mantine-spacing-md) * 2)' }}>Logout</a>
          </Collapse>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
