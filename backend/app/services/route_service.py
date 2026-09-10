from app.integrations.routing_client.client import routing_client
from app.schemas.routes import RouteRequest, RouteAlternativeResponse


class RouteService:
    async def analyze_route_risk(self, req: RouteRequest) -> RouteAlternativeResponse:
        candidate_routes = await routing_client.get_candidate_routes(
            origin_lat=req.origin.latitude,
            origin_lon=req.origin.longitude,
            dest_lat=req.destination.latitude,
            dest_lon=req.destination.longitude,
            travel_mode=req.travel_mode
        )

        # Sort candidate routes by lowest combined risk
        sorted_routes = sorted(candidate_routes, key=lambda r: r.combined_risk)
        
        # Assign ranks
        for idx, r in enumerate(sorted_routes, 1):
            r.rank = idx
            if idx == 1:
                r.risk_tier_description = "Lower Modeled Hazard Exposure (Recommended Alternative Route)"

        recommended_id = sorted_routes[0].route_id

        return RouteAlternativeResponse(
            origin=req.origin,
            destination=req.destination,
            recommended_route_id=recommended_id,
            candidate_routes=sorted_routes
        )


route_service = RouteService()
