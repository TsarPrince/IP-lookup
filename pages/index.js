import { useState, useEffect } from "react"

export default function Home() {
  const [result, setResult] = useState([]);
  useEffect(() => {

    const fetchData = async () => {
      let user = [];
      let source, response, data;

      // 2 req/sec
      source = 'https://ipapi.co/json/';
      response = await fetch(source);
      data = await response.json();
      user.push({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        lat: data.latitude,
        lng: data.longitude,
        org: data.org,
        source
      })

      // 50,000 req/month
      source = 'https://ipinfo.io/json';
      response = await fetch(source);
      data = await response.json();
      user.push({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        lat: data.loc,
        lng: null,
        org: data.org,
        source
      })

      source = 'https://api.db-ip.com/v2/free/self';
      response = await fetch(source);
      data = await response.json();
      user.push({
        ip: data.ipAddress,
        city: data.city,
        region: data.stateProv,
        country: data.countryName,
        lat: null,
        lng: null,
        org: null,
        source
      })

      source = 'https://json.geoiplookup.io/';
      response = await fetch(source);
      data = await response.json();
      user.push({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        lat: data.latitude,
        lng: data.longitude,
        org: data.org || data.asn_org,
        source
      })

      console.log(user)
      setResult(user);

    }
    fetchData();

  }, [])

  return (
    <div className="2xl:container px-2 py-4">
      <div className="text-3xl">
        Croudsourcing valid IP lookup services
      </div>
      <div className='mt-8 border-2 rounded-xl overflow-x-scroll md:overflow-x-auto max-w-6xl'>
        <table className="table-auto text-left w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className='py-4 text-slate-600 font-semibold pl-4'>#</th>
              <th className='py-4 text-slate-600 font-semibold'>IP</th>
              <th className='py-4 text-slate-600 font-semibold'>Region</th>
              <th className='py-4 text-slate-600 font-semibold'>City</th>
              <th className='py-4 text-slate-600 font-semibold'>Country</th>
              <th className='py-4 text-slate-600 font-semibold'>Org</th>
              <th className='py-4 text-slate-600 font-semibold'>Latitude</th>
              <th className='py-4 text-slate-600 font-semibold'>Longitude</th>
            </tr>
          </thead>
          <tbody>
            {
              result.map((user, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 pr-12 pl-4">{index + 1}</td>
                  <td className="py-2 pr-12 whitespace-nowrap">{user.ip ? user.ip : '-'}</td>
                  <td className="py-2 pr-12 whitespace-nowrap">{user.region ? user.region : '-'}</td>
                  <td className="py-2 pr-12 whitespace-nowrap">{user.city ? user.city : '-'}</td>
                  <td className="py-2 pr-12 whitespace-nowrap">{user.country ? user.country : '-'}</td>
                  <td className="py-2 pr-12 whitespace-nowrap">{user.org ? user.org : '-'}</td>
                  <td className="py-2 pr-12 whitespace-nowrap">{user.lat ? user.lat : '-'}</td>
                  <td className="py-2 pr-12 whitespace-nowrap">{user.lng ? user.lng : '-'}</td>
                </tr>
              ))
            }
          </tbody>

        </table>
      </div>
    </div>
  )
}
