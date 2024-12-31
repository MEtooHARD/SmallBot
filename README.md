# SmallBot



# Typescript
  
npm i  
npm start  

Since typescript compiler only add/overwrite with generated js code everytime you remove any .ts file or change their names, please delete whole dist folder before compile.


generate supabase database type
`npx supabase gen types --lang=typescript --project-id "$PROJECT_REF" --schema public > database.types.ts`