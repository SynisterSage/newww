// Parse the real membership data and create TypeScript user objects
const fs = require('fs');

const csvData = `Name,Payment Status,Class,Status,Year Joined,Birthday,B,B-Free,HF,J,F,S,Lockers,Spouse Locker,Bag Storage,Food,Extra Handicap,Restricted Assessment,Special Considerations,Lottery Eligible
"Allerton, Keith",Paid,AG,Active,2024,1953,,Jeanne,,,,,FALSE,FALSE,FALSE,  533.00 ,,,,2/18/2025
"Amoruso, Robert",Paid,AGH,Active,2015,1947,,,,,,,FALSE,FALSE,FALSE,  533.00 ,,X,,1/27/2025
"Avedissian, Christian",Payment Plan,A,Active,2025,,,,,,,,FALSE,FALSE,FALSE,  533.00 ,,,,
"Avedissian, Jason",Payment Plan,A,Active,2025,,,,,,,,FALSE,FALSE,FALSE,  533.00 ,,,,
"Axberg, George",Payment Plan,G,Active,2012,,,,,,,,TRUE,FALSE,FALSE,  373.00 ,,,,
"Baker, William J.",Paid,H,Active,,,,,,,,,FALSE,FALSE,FALSE,  533.00 ,,X,,
"Barchie, Eric",Payment Plan,AG,Active,2025,1975,,,,,,,FALSE,FALSE,FALSE,  533.00 ,,,,
"Barwick, Robert",Paid,A,Active,2014,,,,,,,,TRUE,FALSE,FALSE,  533.00 ,,,,2/12/2025
"Batikha, Charles",Paid,AG,Active,2022,1989,,,,,,,FALSE,FALSE,FALSE,  533.00 ,,,,
"Bauer, Leo",Paid,A,Active,1995,,,,,,,,TRUE,FALSE,FALSE,  533.00 ,,,,
"Bayley, Robert",Paid,A,Active,1982,1956,,,,,,,FALSE,FALSE,FALSE,  533.00 ,,,,
"Becker, Rosemarie",Paid,AGG+75,Active,2019,1937,,,,,,,FALSE,FALSE,FALSE,  373.00 ,,X,,
"Berg, Aaron",Paid,A,Active,2021,1972,,,,,,,TRUE,FALSE,TRUE,  533.00 ,,,,
"Betz, William",Paid,A,Active,2021,1988,,,,,,,TRUE,FALSE,FALSE,  533.00 ,,,,2/15/2025
"Betz, William P",Paid,HM,Active,2025,,,,,,,,FALSE,FALSE,FALSE, None ,,,,
"Biagini, Randy",Paid,A,Active,1995,,Kim,,,,,,BOARD,TRUE,FALSE,  533.00 ,,,,2/14/2025
"Bianchi, Kyle",Paid,A,Active,2023,1990,,,,,,,FALSE,FALSE,FALSE,  533.00 ,,,,2/4/2025
"Blake, Jim",Paid,AG,Active,2022,1962,Cari,,,,,,FALSE,FALSE,TRUE,  533.00 ,,,,1/21/2025
"Bolton, Jonathan",Payment Plan,AG,Active,2014,,Spouse,,,,,,TRUE,FALSE,TRUE,  533.00 ,,,,
"Bowie, David",Payment Plan,G,Active,2017,1983,Kristen,,,,,,FALSE,FALSE,FALSE,  373.00 ,,,,`;

const lines = csvData.split('\n').slice(1); // Skip header
const members = [];

lines.forEach((line, index) => {
  if (line.trim()) {
    // Simple CSV parsing - handle quoted fields
    const parts = line.match(/("([^"]*)"|[^,]*)/g);
    if (parts && parts.length >= 4) {
      const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());
      
      const [name, paymentStatus, memberClass, status, yearJoined, birthday, spouse] = cleanParts;
      
      if (name && name !== 'Name') {
        const [lastName, firstName] = name.split(', ');
        const memberNumber = `${memberClass}${String(index + 1).padStart(3, '0')}`;
        
        const member = {
          id: `user-${index + 1}`,
          username: `${firstName?.toLowerCase() || 'member'}.${lastName?.toLowerCase() || index}`,
          password: 'password123',
          email: `${firstName?.toLowerCase() || 'member'}.${lastName?.toLowerCase() || index}@email.com`,
          firstName: firstName || 'Member',
          lastName: lastName || `${index + 1}`,
          phone: `(973) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          memberNumber: memberNumber,
          memberStatus: paymentStatus || 'Paid',
          membershipType: memberClass || 'A',
          address: `${Math.floor(Math.random() * 999 + 1)} Golf Course Drive`,
          city: 'Wayne',
          state: 'NJ',
          zipCode: '07470',
          emergencyContact: spouse || 'Emergency Contact',
          emergencyPhone: `(973) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          handicap: Math.floor(Math.random() * 28 + 1),
          roundsPlayed: Math.floor(Math.random() * 100),
          accountBalance: paymentStatus === 'Paid' ? '0.00' : `${Math.floor(Math.random() * 500 + 50)}.00`,
          joinDate: new Date(yearJoined || '2020'),
          isActive: status === 'Active'
        };
        
        members.push(member);
      }
    }
  }
});

console.log(`Generated ${members.length} members`);
console.log('Sample:', members[0]);

// Generate the TypeScript code
const membersCode = `    const members: User[] = ${JSON.stringify(members, null, 6)};`;

fs.writeFileSync('real-members-output.ts', membersCode);
console.log('Saved to real-members-output.ts');