import { AppBar, Container, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import FlareOutlinedIcon from "@mui/icons-material/FlareOutlined";

// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import Select, { SelectChangeEvent } from "@mui/material/Select";
// import { Box, FormControl } from "@mui/material";
// import { FormattedMessage, useIntl } from "react-intl";
// import { RootState } from "../store/store";
// import { setLocale } from "../store/appSlice";
// import { LOCALES } from "../i18n/locales";

// Languages
// const languages = [
//   { name: "English", code: LOCALES.ENGLISH },
//   { name: "Spanish", code: LOCALES.SPANISH },
// ];

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: 'transparent',
  boxShadow: 'none'
}));

export default function Header() {
  // const [language, setLanguage] = useState(locale);
  // const intl = useIntl();

  // const handleChange = (
  //   event: SelectChangeEvent<string>,
  //   _child: React.ReactNode
  // ) => {
  //   setLanguage(event.target.value);
  //   dispatch(setLocale(event.target.value));
  // };

  return (
    <StyledAppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <FlareOutlinedIcon sx={{ display: { xs: 'flex', md: 'flex' }, mr: 2 }} />
          <Typography
            variant="h6"
            noWrap
            component="span"
            sx={{
              minWidth: '294px',
              display: { xs: 'flex', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Liga Tenis Málaga
          </Typography>
          {/* <Box display="flex" justifyContent="flex-end">
            <FormControl size="small">
              <InputLabel id="language-label">
                <FormattedMessage id="language" />
              </InputLabel>
              <Select
                labelId="language-label"
                label={intl.formatMessage({ id: "language" })}
                value={language}
                onChange={handleChange}
              >
                {languages.map(({ name, code }) => (
                  <MenuItem key={code} value={code}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box> */}
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
}