import React from 'react'
import { Avatar, Box, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import NavBarSignedIn from '../components/NavBarSignedIn'

const ResultsPage = () => {
  const stats = [{name:"Questions answered",value:"20"},{name:"Score",value:"400"}];//TODO switch for generated values
  return (
    <Box>
      <NavBarSignedIn />
      <Box style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
        <Card sx={{textAlign:"center",bgcolor:"secondary.light"}}>
          <CardContent>
            <Avatar sx={{ margin: "auto", width: 60, height: 60 }} />
            <Typography component="h2" variant="h5">Your statistics:</Typography>
            <TableContainer sx={{padding:"1rem"}}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Stat</b></TableCell>
                    <TableCell><b>Value</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell>{stat.name}</TableCell>
                      <TableCell>{stat.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button fullWidth variant='outlined'>Play again</Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default ResultsPage