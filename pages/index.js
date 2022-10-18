import { useState, useEffect } from "react"

export default function Home() {
  const [result, setResult] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {

    const fetchData = async () => {
      let user = [];

      // provided by ipgeolocation.abstractapi.com
      let flag, vpn;

      try {
        // 10,000 req/month
        let source = `https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.NEXT_PUBLIC_ABSTRACTAPI_KEY}`;
        let response = await fetch(source);
        let data = await response.json();
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
        let source = 'https://ipapi.co/json/';
        let response = await fetch(source);
        let data = await response.json();
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
      } catch (err) {
        console.log(err);
      }

      try {
        // 50,000 req/month
        let source = 'https://ipinfo.io/json';
        let response = await fetch(source);
        let data = await response.json();
        if (data.loc) {
          const [lat, lng] = data.loc.split(',');
          data.lat = lat;
          data.lng = lng;
        }
        user.push({
          ip: data.ip,
          city: data.city,
          region: data.region,
          postal_code: data.postal,
          country: data.country,
          lat: data.lat,
          lng: data.lng,
          org: data.org,
          source
        })
      } catch (err) {
        console.log(err);
      }

      try {
        let source = 'https://api.db-ip.com/v2/free/self';
        let response = await fetch(source);
        let data = await response.json();
        user.push({
          ip: data.ipAddress,
          city: data.city,
          region: data.stateProv,
          postal_code: null,
          country: data.countryName,
          lat: null,
          lng: null,
          org: null,
          source
        })
      } catch (err) {
        console.log(err);
      }

      try {
        let source = 'https://json.geoiplookup.io/';
        let response = await fetch(source);
        let data = await response.json();
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
      } catch (err) {
        console.log(err);
      }
      setResult(user);






      // save the information in database
      try {
        const visitor = {
          data: user,
          flag, vpn
        }
        let response = await fetch('http://localhost:8080/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(visitor)
        })
        let data = await response.json();
        if (response.status !== 200) {
          alert(data.message)
        }
      } catch (err) {
        console.log(err);
      }
      
      
      // display all the stored users
      const dbURL = 'https://do-not-open-pls-uwu-database.herokuapp.com';
      try {
        let response = await fetch(`${dbURL}/visitors`);
        let data = await response.json();
        setVisitors(data);
      } catch (err) {
        console.log(err);
      }
      
      

    }
    fetchData();

  }, [])

  return (
    <div className="2xl:container px-2 py-4 md:px-6 lg:px-12">
      <div className="text-3xl">
        Croudsourcing valid IP lookup services
      </div>
      <div className='mt-8 border-2 rounded-xl overflow-x-scroll md:overflow-x-auto w-full'>
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
  )
}
