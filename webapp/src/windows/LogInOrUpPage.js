import {React,useState} from 'react'
import AddUser from '../components/AddUser';
import {Card,Typography,Link,Grid,CardContent} from '@mui/material';
import Login from '../components/Login'
import NavBar from '../components/NavBar'
import { useParams } from 'react-router-dom';

const LogInOrUpPage = () => {

  const {loginRequested}=useParams();//the login view is asked if true
  const [loginShown,alternateAuthMethod] = useState(loginRequested==='true');
  const switchAuthentificationMethod =()=>{
    alternateAuthMethod(!loginShown);
  }
  
  return (
    <Grid>
      <NavBar/>
    {loginShown ? (
        <Card variant="outlined">
        <CardContent>
            <Login></Login>
            <Typography>
                Don't have an account? 
            </Typography>
            <Link component='button' onClick={switchAuthentificationMethod}>
                Register here.
            </Link>
        </CardContent>
        </Card>
        ):(
        <Card variant="outlined">
        <CardContent>
            <AddUser></AddUser>
            <Typography>
                Already have an account? 
            </Typography>
            <Link component='button' onClick={switchAuthentificationMethod}>
            Login here.
            </Link>
        </CardContent>
        </Card>
    )}
    </Grid>
  )
}

export default LogInOrUpPage;