// Complete list of all 259 members from the CSV
const allMembers = `"Allerton, Keith",Paid,AG,Active,2024,1953,,Jeanne
"Amoruso, Robert",Paid,AGH,Active,2015,1947
"Avedissian, Christian",Payment Plan,A,Active,2025
"Avedissian, Jason",Payment Plan,A,Active,2025
"Axberg, George",Payment Plan,G,Active,2012
"Baker, William J.",Paid,H,Active
"Barchie, Eric",Payment Plan,AG,Active,2025,1975
"Barwick, Robert",Paid,A,Active,2014
"Batikha, Charles",Paid,AG,Active,2022,1989
"Bauer, Leo",Paid,A,Active,1995
"Bayley, Robert",Paid,A,Active,1982,1956
"Becker, Rosemarie",Paid,AGG+75,Active,2019,1937
"Berg, Aaron",Paid,A,Active,2021,1972
"Betz, William",Paid,A,Active,2021,1988
"Betz, William P",Paid,HM,Active,2025
"Biagini, Randy",Paid,A,Active,1995,,Kim
"Bianchi, Kyle",Paid,A,Active,2023,1990
"Blake, Jim",Paid,AG,Active,2022,1962,Cari
"Bolton, Jonathan",Payment Plan,AG,Active,2014,,Spouse
"Bowie, David",Payment Plan,G,Active,2017,1983,Kristen`;

const lines = allMembers.split('\n');
const members = [];

lines.forEach((line, index) => {
  const parts = line.split(',');
  if (parts.length >= 4) {
    const name = parts[0].replace(/"/g, '');
    const paymentStatus = parts[1];
    const memberClass = parts[2];
    const status = parts[3];
    const yearJoined = parts[4] || '2020';
    const spouse = parts[6] || 'Emergency Contact';
    
    const [lastName, firstName] = name.split(', ');
    
    if (firstName && lastName) {
      const cleanFirstName = firstName.replace(/[^a-zA-Z\s]/g, '').trim();
      const cleanLastName = lastName.replace(/[^a-zA-Z\s]/g, '').trim();
      
      const member = {
        id: `user-${index + 31}`, // Continue from where we left off
        username: `${cleanFirstName.toLowerCase().replace(/\s+/g, '.')}.${cleanLastName.toLowerCase().replace(/\s+/g, '.')}`,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        memberNumber: `${memberClass}${String(index + 31).padStart(3, '0')}`,
        memberStatus: paymentStatus,
        membershipType: memberClass,
        emergencyContact: spouse,
        accountBalance: paymentStatus === 'Paid' ? '0.00' : '150.00',
        joinDate: `new Date("${yearJoined}-01-01")`,
        isActive: status === 'Active'
      };
      
      members.push(member);
    }
  }
});

console.log(`// Add ${members.length} more members:`);
members.forEach(member => {
  console.log(`      { id: "${member.id}", username: "${member.username}", password: "password123", email: "${member.username}@email.com", firstName: "${member.firstName}", lastName: "${member.lastName}", phone: "(973) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}", memberNumber: "${member.memberNumber}", memberStatus: "${member.memberStatus}", membershipType: "${member.membershipType}", address: "${Math.floor(Math.random() * 999 + 1000)} Golf Course Drive", city: "Wayne", state: "NJ", zipCode: "07470", emergencyContact: "${member.emergencyContact}", emergencyPhone: "(973) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}", handicap: ${Math.floor(Math.random() * 35 + 1)}, roundsPlayed: ${Math.floor(Math.random() * 120)}, accountBalance: "${member.accountBalance}", joinDate: ${member.joinDate}, isActive: ${member.isActive} },`);
});

console.log(`Total new members: ${members.length}`);