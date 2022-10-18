import { useState, useEffect } from "react"

export default function Home() {
  const [result, setResult] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [duplicateIP, setDuplicateIP] = useState(false);
  const [newUser, setNewUser] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      let user = [];
      let source, response, data;
      // provided by ipgeolocation.abstractapi.com
      let flag, vpn;

      try {
        // 10,000 req/month
        source = `https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.NEXT_PUBLIC_ABSTRACTAPI_KEY}`;
        response = await fetch(source);
        data = await response.json();
        user.push({
          ip: data.ip_address,
          city: data.city,
          region: data.region,
          postal_code: data.postal_code,
          country: data.country,
          lat: data.latitude,
          lng: data.longitude,
          org: data.connection ? (data.connection.organization_name || data.connection.autonomous_system_organization) : '-',
          source
        })
        flag = data.flag ? data.flag.svg : null;
        vpn = data.security ? data.security.is_vpn : null;
      } catch (err) {
        console.log(err);
      }

      try {
        // 2 req/sec
        source = 'https://ipapi.co/json/';
        response = await fetch(source);
        data = await response.json();
        user.push({
          ip: data.ip,
          city: data.city,
          region: data.region,
          postal_code: data.postal,
          country: data.country_name,
          lat: data.latitude,
          lng: data.longitude,
          org: data.org,
          source
        })
        setResult(user);
      } catch (err) {
        console.log(err)
      }

      // try {
      //   // 50,000 req/month
      //   source = 'https://ipinfo.io/json';
      //   response = await fetch(source);
      //   data = await response.json();
      //   if (data.loc) {
      //     const [lat, lng] = data.loc.split(',');
      //     data.lat = lat;
      //     data.lng = lng;
      //   }
      //   user.push({
      //     ip: data.ip,
      //     city: data.city,
      //     region: data.region,
      //     postal_code: data.postal,
      //     country: data.country,
      //     lat: data.lat,
      //     lng: data.lng,
      //     org: data.org,
      //     source
      //   })
      //   setResult(user);
      // } catch (err) {
      //   console.log(err)
      // }


      // try {
      //   source = 'https://api.db-ip.com/v2/free/self';
      //   response = await fetch(source);
      //   data = await response.json();
      //   user.push({
      //     ip: data.ipAddress,
      //     city: data.city,
      //     region: data.stateProv,
      //     postal_code: null,
      //     country: data.countryName,
      //     lat: null,
      //     lng: null,
      //     org: null,
      //     source
      //   })
      //   setResult(user);
      // } catch (err) {
      //   console.log(err);
      // }

      try {
        source = 'https://json.geoiplookup.io/';
        response = await fetch(source);
        data = await response.json();
        user.push({
          ip: data.ip,
          city: data.city,
          region: data.region,
          postal_code: null,
          country: data.country_name,
          lat: data.latitude,
          lng: data.longitude,
          org: data.org || data.asn_org,
          source
        })
        setResult(user);
      } catch (err) {
        console.log(err);
      }




      /************************************************************************** 
       save the information in database
       *************************************************************************/
      const dbURL = 'https://do-not-open-pls-uwu-database.herokuapp.com';
      const visitor = {
        data: user,
        flag, vpn
      }

      try {
        response = await fetch(`${dbURL}/visitors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(visitor)
        })
        data = await response.json();
        // check for duplicate ip
        if (response.status !== 200) {
          const errMessage = data.message;
          const errCode = errMessage.split(' ')[0];
          if (errCode === 'E11000') {
            setDuplicateIP(true);
          } else {
            setNewUser(true);
          }
        }
      } catch (err) {
        console.log(err);
      }


      /************************************************************************** 
       display already stored information from database
       *************************************************************************/

      try {
        response = await fetch(`${dbURL}/visitors`);
        data = await response.json();
        if (response.status === 200) {
          setVisitors(data.visitors);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();

  }, [])

  return (
    <div className="2xl:container mx-auto px-4 py-4 md:px-24">
      <div className="mt-8 md:mb-16">
        <p className="text-xl md:text-3xl font-medium md:font-normal text-slate-700">
          This is where you will be known at last, for who you truly are.
        </p>
      </div>

      <div className="mt-8 space-y-2">
        <p className="text-slate-500">What we think of your IP Address. City/Province might not be correct.</p>
        {/* collected data */}
        <div className='border-2 rounded-xl overflow-x-scroll md:overflow-x-auto w-full'>
          <table className="table-auto text-left w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className='py-4 pr-6 text-slate-600 font-semibold pl-4'>#</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>City</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Region</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Country</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Postal</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Org</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Latitude</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Longitude</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>IP</th>
              </tr>
            </thead>
            <tbody>
              {
                result.map((user, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 pr-12 pl-4">{index + 1}</td>
                    <td className="py-2 pr-12 whitespace-nowrap">{user.city ? user.city : '-'}</td>
                    <td className="py-2 pr-12 whitespace-nowrap">{user.region ? user.region : '-'}</td>
                    <td className="py-2 pr-12 whitespace-nowrap">{user.country ? user.country : '-'}</td>
                    <td className="py-2 pr-12 whitespace-nowrap">{user.postal_code ? user.postal_code : '-'}</td>
                    <td className="py-2 pr-12 whitespace-nowrap">{user.org ? user.org : '-'}</td>
                    <td className="py-2 pr-12 whitespace-nowrap">{user.lat ? user.lat : '-'}</td>
                    <td className="py-2 pr-12 whitespace-nowrap">{user.lng ? user.lng : '-'}</td>
                    <td className="py-2 pr-12 whitespace-nowrap">{user.ip ? user.ip : '-'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {
        newUser
          ? <div className="mt-8">
            <p className="border border-green-500 text-green-500 rounded-xl px-4 py-2 text-lg font-medium hover:bg-green-500 hover:text-white hover:cursor-pointer transition-all">
              Thankyou for <span className="italic">willingly</span> submitting your information here.😺
            </p>
          </div>
          : <div></div>
      }
      {
        duplicateIP
          ? <div className="mt-8">
            <p className="border border-pink-500 text-pink-500 rounded-xl px-4 py-2 text-lg font-medium hover:bg-pink-500 hover:text-white hover:cursor-pointer transition-all">
              We already have your data. That means you are of no use to us now, hence we <span className="italic">harshly</span> request you to leave. Please do NOT visit again 😺
            </p>
          </div>
          : <div></div>
      }

      <div className="mt-8 space-y-2">
        <p className="text-slate-500">You are now a part of this table</p>

        {/* previous visitors data */}
        <div className='border-2 rounded-xl overflow-x-scroll md:overflow-x-auto w-full'>
          <table className="table-auto text-left w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className='py-4 pr-6 text-slate-600 font-semibold pl-4'>#</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'></th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>City</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Region</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Country</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Postal</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Org</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Latitude</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>Longitude</th>
                <th className='py-4 pr-6 text-slate-600 font-semibold'>IP</th>
              </tr>
            </thead>
            <tbody>
              {
                visitors.reverse().map((visitor, index) => {
                  let user;
                  if (visitor.data[0].city) {
                    user = visitor.data[0];
                  } else if (visitor.data[1].city) {
                    user = visitor.data[1];
                  } else {
                    user = visitor.data[2];
                  }
                  return (
                    <tr key={visitor._id} className="border-b">
                      <td className="py-2 px-4 whitespace-nowrap">{index + 1}</td>
                      <td className="">
                        <div className="px-1 mx-4 w-8 select-none">
                          <img className="w-8" src={visitor.flag}></img>
                        </div>
                      </td>
                      <td className="py-2 pr-12 whitespace-nowrap">{user.city ? user.city : '-'}</td>
                      <td className="py-2 pr-12 whitespace-nowrap">{user.region ? user.region : '-'}</td>
                      <td className="py-2 pr-12 whitespace-nowrap">{user.country ? user.country : '-'}</td>
                      <td className="py-2 pr-12 whitespace-nowrap">{user.postal_code ? user.postal_code : '-'}</td>
                      <td className="py-2 pr-12 whitespace-nowrap">{user.org ? user.org : '-'}</td>
                      <td className="py-2 pr-12 whitespace-nowrap">{user.lat ? user.lat : '-'}</td>
                      <td className="py-2 pr-12 whitespace-nowrap">{user.lng ? user.lng : '-'}</td>
                      <td className="py-2 pr-12 whitespace-nowrap">{user.ip ? user.ip : '-'}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>


    </div>
  )
}
