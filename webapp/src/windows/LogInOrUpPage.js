import {React,useState} from 'react'
import AddUser from '../components/AddUser';
import {Card,Typography,Link,Stack,CardContent} from '@mui/material';
import Login from '../components/Login'

const LogInOrUpPage = () => {

  const [showLogin, setShowLogin] = useState(true);

  const handleToggleView = () => {
    setShowLogin(!showLogin);
  };

  
  return (
    <Stack>
    {showLogin ? (
        <Card variant="outlined" sx={{borderRadius:5}}>
        <CardContent>
            <Login></Login>
            <Typography>
                Don't have an account? 
            </Typography>
            <Link align='center' component="button" onClick={handleToggleView}>
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
            <Link component="button" onClick={handleToggleView}>
            Login here.
            </Link>
        </CardContent>
        </Card>
    )}
    </Stack>
  )
}

export default LogInOrUpPage;