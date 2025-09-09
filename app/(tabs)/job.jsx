import TabHeader from "components/TabHeader/TabHeader";
import { useState } from "react";

function job() {

    const [banner, setBanner] = useState(false);
    
    return (
        <>
            <TabHeader title={"Job"} icon={"information-outline"} onPress={() => setBanner((v) => !v)} />
        </>
    );
}

export default job;