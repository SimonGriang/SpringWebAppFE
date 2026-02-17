import { Box, Group, Image } from '@mantine/core';
import classes from '../stylings/HeaderStyling.module.css';

export const MinimalHeader = () => {

  return (
    <Box className={classes.header}>
      <Group justify="space-between" align="center" h="100%">
        
        {/* LINKS: Logo */}
        <Group>
          <Image
            src="/GriangLogo_ws.png"
            alt="Logo"
            height={30}
            fit="contain"
          />
        </Group>

        {/* RECHTS: optional Platzhalter */}
        <div />
        
      </Group>
    </Box>
  );
};