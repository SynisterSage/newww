// No fs needed for this script

// Lunch menu data
const lunchMenuData = `Name,Description,Price,Category,Available_Settings
Rainbow Mesclun,"Assorted Greens, Tomatoes, Cucumbers, Shredded Carrots & Choice of Dressing",12.00,Salads,House-Made Balsamic; Champagne; Honey Mustard; Blue Cheese; Thousand Island; Ranch; EVOO & Balsamic Vinegar
Classic Caesar,"Romaine, Parmesan, Croutons & Caesar Dressing",12.00,Salads,
Quinoa,"Baby Arugula, Cherry Tomatoes, Sweet Red Onions, Corn, Avocado & Sherry Vinaigrette",16.00,Salads,
Queen,"Assorted Greens, Dried Cranberries, Fresh Strawberries, Blackberries, Orange Segments, Candied Walnuts & Champagne Vinaigrette",16.00,Salads,
Bam-Bam Shrimp Wrap,"Mixed Greens & Tomatoes",18.00,Chef Specialties,
Brisket Sandwich,"Braised Brisket, Melted Provolone & Fried Onions on Ciabatta",21.00,Chef Specialties,
12' Cheese Pizza,"Cheese pizza (12") – toppings $1.50 each: Mushrooms; Pepperoni; Peppers; Onions",14.00,Chef Specialties,Mushrooms; Pepperoni; Peppers; Onions
10 oz Angus Burger,"Served with Lettuce, Tomato & Red Onion on Brioche",18.00,Packanack's Picks,Bacon; Sautéed Onions; American; Cheddar; Swiss Cheese
Veggie Burger,"Served with Lettuce, Tomato & Red Onion on Brioche",14.50,Packanack's Picks,Sautéed Onions; American; Cheddar; Swiss Cheese; Blue Cheese
Thummans All Beef Hot Dog,"Served with Sauerkraut",8.00,Packanack's Picks,Sauerkraut
Chicken Wings (7),"Served with Celery & choice of Blue Cheese or Cool Ranch",12.00,Packanack's Picks,Buffalo; BBQ; Sweet Thai Chili; Cajun
Chicken Wings (16),"Served with Celery & choice of Blue Cheese or Cool Ranch",23.00,Packanack's Picks,Buffalo; BBQ; Sweet Thai Chili; Cajun
Chicken Quesadilla,"Served with Salsa & Sour Cream",14.00,Packanack's Picks,Salsa; Sour Cream
Happy Waitress,"Grilled Cheese with Tomato & Crispy Bacon",14.00,Packanack's Picks,
French Fries,"French Fries",4.75,Sides,
French Fries with Cheese,"French Fries with Cheese",6.00,Sides,
French Fries with Cheese & Bacon,"French Fries with Cheese & Bacon",8.50,Sides,
Beer Battered Onion Rings,"Beer Battered Onion Rings",7.00,Sides,
BLTA,"Crispy Bacon, Lettuce, Tomato & Avocado on choice of bread",14.00,Sandwiches,French Fries; Cole Slaw; Fresh Fruit Salad
Turkey Sloppy Joe,"Turkey Breast, Swiss Cheese, Cole Slaw & Russian Dressing on Rye",16.00,Sandwiches,French Fries; Cole Slaw; Fresh Fruit Salad
Turkey Club,"Turkey Breast, Swiss Cheese, Bacon, Avocado, Lettuce & Tomato on White Toast",17.00,Sandwiches,French Fries; Cole Slaw; Fresh Fruit Salad
Fried Chicken Sandwich,"Crispy Chicken, Lettuce, Pickles, Pickled Radish & Chipotle Aioli on a Butter Roll",15.50,Sandwiches,French Fries; Cole Slaw; Fresh Fruit Salad
Grilled Chicken Club,"Marinated Chicken, Bacon, Lettuce, Tomato & Mayo on Ciabatta",16.75,Sandwiches,French Fries; Cole Slaw; Fresh Fruit Salad
Crabcake Sandwich,"Rainbow Greens, Avocado, Bacon & Tartar Sauce on Brioche",18.00,Sandwiches,French Fries; Cole Slaw; Fresh Fruit Salad
The Godfather,"Chicken Cutlet, Broccoli Rabe & Melted Provolone on French Loaf",18.00,Sandwiches,French Fries; Cole Slaw; Fresh Fruit Salad
Ribeye Steak Sandwich,"Diced Peppers, Onions, Mushrooms, Melted Provolone & Au Jus on French Loaf",21.00,Sandwiches,French Fries; Cole Slaw; Fresh Fruit Salad
Tuna Salad BLT,"Tuna Salad, Bacon, Lettuce & Tomato",16.00,Wraps,French Fries; Cole Slaw; Fresh Fruit Salad
Buffalo Chicken,"Chicken Fingers, Lettuce, Tomato, Red Onion, Blue Cheese & Buffalo Sauce",15.50,Wraps,French Fries; Cole Slaw; Fresh Fruit Salad
Grilled Chicken Caesar,"Grilled Chicken, Parmesan Cheese & Caesar Dressing",15.00,Wraps,French Fries; Cole Slaw; Fresh Fruit Salad
Grilled Chicken Waldorf,"Grilled Chicken, Apple, Grapes & Walnuts",16.00,Wraps,French Fries; Cole Slaw; Fresh Fruit Salad
Cheezy Western Omelet,"(3) Eggs, Diced Peppers, Onions, Mushrooms, Ham, Cheese, Fries & Toast",14.00,Breakfast Corner,
Taylor Ham, Egg & Cheese,"Taylor Ham, Egg & Cheese",10.00,Breakfast Corner,
Bacon, Egg & Cheese,"Bacon, Egg & Cheese",10.00,Breakfast Corner,`;

// Dinner menu data  
const dinnerMenuData = `Name,Description,Price,Category,Available_Settings
Shrimp In White Wine Garlic Sauce,"Served with Grilled Bread",15.00,Starters,
Spinach & Artichoke Dip,"Served with Tortilla Chips",13.00,Starters,
Chicken Lemongrass Dumplings,"Steamed or Fried, served with Ponzu Scallion Sauce",10.00,Starters,
Bam-Bam Shrimp,"Crispy Shrimp in a Creamy Sweet Chili Sauce",18.00,Starters,
Fried Calamari,"Served with Marinara & Lemon Wedges",14.00,Starters,
House Salad,"Fresh Garden Greens, Tomatoes, Cucumbers & Carrots with choice of dressing",6.50,Salads,"Dressings: House-Made Balsamic Vinaigrette; Champagne Vinaigrette; Honey Mustard; Blue Cheese; Thousand Island; Ranch; EVOO & Balsamic Vinegar; Enhancements: Grilled Chicken $6; Grilled Steak $15; Crabcake $9.50; Grilled Shrimp $10; Grilled Salmon $9.50"
House Salad (Large),"Fresh Garden Greens, Tomatoes, Cucumbers & Carrots with choice of dressing",12.00,Salads,"Dressings: House-Made Balsamic Vinaigrette; Champagne Vinaigrette; Honey Mustard; Blue Cheese; Thousand Island; Ranch; EVOO & Balsamic Vinegar; Enhancements: Grilled Chicken $6; Grilled Steak $15; Crabcake $9.50; Grilled Shrimp $10; Grilled Salmon $9.50"
Classic Caesar Salad,"Crisp hearts of Romaine, homemade croutons & Parmesan cheese",6.50,Salads,"Dressings: Caesar; Enhancements: Grilled Chicken $6; Grilled Steak $15; Crabcake $9.50; Grilled Shrimp $10; Grilled Salmon $9.50"
Classic Caesar Salad (Large),"Crisp hearts of Romaine, homemade croutons & Parmesan cheese",12.00,Salads,"Dressings: Caesar; Enhancements: Grilled Chicken $6; Grilled Steak $15; Crabcake $9.50; Grilled Shrimp $10; Grilled Salmon $9.50"
Packanack Salad,"Mesclun greens, fresh strawberries, mango, goat cheese, walnuts & sun-dried cranberries with Champagne vinaigrette",16.50,Salads,"Enhancements: Grilled Chicken $6; Grilled Steak $15; Crabcake $9.50; Grilled Shrimp $10; Grilled Salmon $9.50"
French Onion Soup,,7.00,Soups,
Chili All The Way Soup,,7.00,Soups,
Soup Du Jour,,7.00,Soups,
Farfalle with Italian Sausage & Broccoli Rabe,"Pecorino cheese & grilled bread",14.00,Pastas,
Four Cheese Ravioli,"In a creamy pesto sauce",20.00,Pastas,
PGC Penne Vodka,"Mushrooms, onions, English peas & sun-dried tomatoes tossed in vodka sauce",19.00,Pastas,"Enhancements: Grilled Chicken $6; Salmon $9.50; Grilled Shrimp $10"
Seared Salmon,"With chunky avocado/mango salsa; served with sautéed garden vegetables over basmati rice",28.00,"Entrees – Seafood",
Pan Seared Bronzino,"With Mediterranean herbs; served with mashed potatoes, broccolini, pearl onions & carrots",33.00,"Entrees – Seafood",
Filet Mignon,"Grilled asparagus, mushrooms & mashed potatoes",41.00,"Entrees – Meat","Preparation: Simply Grilled; Blackened; Gorgonzola Crusted; Maître D'hôtel Butter"
Rosemary & Garlic Flat Iron Steak,"Haricot verts, squash, zucchini, onions & mashed potatoes",33.00,"Entrees – Meat",
Saltimbocca,"Topped with spinach, prosciutto, provolone & mushroom sauce; served with choice of pasta",26.00,"Entrees – Chicken","Choice of Pasta"
Parmesan/Marsala/Française Chicken,"Served with choice of pasta",22.00,"Entrees – Chicken","Preparation: Parmesan; Marsala; Française; Choice of Pasta"
10 oz Black Angus Burger,"Served with French fries",18.00,Casual,"Add-ons: Bacon; Sautéed Onions; Sautéed Mushrooms; American Cheese; Swiss Cheese; Cheddar Cheese; Blue Cheese"
Grilled Chicken Sandwich,"Grilled chicken, eggplant, grilled red peppers, bacon & provolone cheese on brioche; served with French fries",16.50,Casual,
Crabcake Sandwich,"Mixed greens, avocado, bacon & tartar sauce; served with French fries",18.00,Casual,
Club Sandwich,"Turkey, bacon, Swiss cheese, avocado, lettuce, tomato & mayo on white toast; served with French fries",17.00,Casual,
Tacos,"Cumin-baked choice of meat with lettuce, tomato, lime mayo aioli & cole slaw; served on corn or flour tortilla",varies,Casual,"Meat: Chicken $15; St. Peters Fish $15; Shrimp $19; Steak $23; Tortillas: Corn; Flour"`;

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const items = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    const item = {};
    headers.forEach((header, index) => {
      item[header.trim()] = values[index] || '';
    });
    items.push(item);
  }
  
  return items;
}

function generateInsertStatements(items, mealType) {
  const statements = [];
  
  items.forEach(item => {
    const name = item.Name?.replace(/'/g, "''") || '';
    const description = item.Description?.replace(/'/g, "''") || '';
    const price = parseFloat(item.Price) || 0;
    const category = item.Category?.replace(/'/g, "''") || '';
    const availableSettings = item.Available_Settings?.replace(/'/g, "''") || '';
    
    if (name && price > 0) {
      statements.push(`INSERT INTO menu_items (name, description, price, category, meal_type, available_settings, available) VALUES ('${name}', '${description}', ${price}, '${category}', '${mealType}', '${availableSettings}', true);`);
    }
  });
  
  return statements;
}

// Parse and generate SQL
const lunchItems = parseCSV(lunchMenuData);
const dinnerItems = parseCSV(dinnerMenuData);

const lunchSQL = generateInsertStatements(lunchItems, 'lunch');
const dinnerSQL = generateInsertStatements(dinnerItems, 'dinner');

console.log('-- Lunch Menu Items');
lunchSQL.forEach(sql => console.log(sql));

console.log('\n-- Dinner Menu Items');
dinnerSQL.forEach(sql => console.log(sql));