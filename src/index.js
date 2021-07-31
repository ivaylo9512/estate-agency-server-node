import { initialize } from './app.js' 

const main = async() => {
    const port = process.env.PORT || 8098;
    const { app } = await initialize();
    
    app.listen(port, () => {
        console.log(`\n🚀!! server started on http://localhost:${port} !!`)
    }) 
} 
main().catch(err => console.log(err))