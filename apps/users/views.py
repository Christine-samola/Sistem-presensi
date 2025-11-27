from rest_framework import status, generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

from .serializers import LoginSerializer, UserSerializer
from .models import User
from .permissions import IsAdmin


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": UserSerializer(user).data,
            }
        )


class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_str = request.data.get("refresh_token")
        if not token_str:
            return Response({"detail": "refresh_token required"}, status=400)
        try:
            refresh = RefreshToken(token_str)
            access = refresh.access_token
            return Response({"access_token": str(access)})
        except Exception:
            return Response({"detail": "invalid refresh token"}, status=400)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        print(f"[MeView] User: {request.user}")
        print(f"[MeView] Request data: {request.data}")
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        print(f"[MeView] Update successful: {serializer.data}")
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        print(f"[ChangePassword] User: {request.user}")
        print(f"[ChangePassword] Request data: {request.data}")
        
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        
        if not (old_password and new_password):
            print("[ChangePassword] Missing password fields")
            return Response({"detail": "old_password and new_password required"}, status=400)
        
        # Basic validation - minimal 3 characters
        if len(new_password) < 3:
            return Response({"detail": "Password minimal 3 karakter"}, status=400)
        
        user: User = request.user
        if not user.check_password(old_password):
            print("[ChangePassword] Old password incorrect")
            return Response({"detail": "Password lama tidak sesuai"}, status=400)
        
        # Set new password without Django's strict validation
        user.set_password(new_password)
        user.save()
        print("[ChangePassword] Password changed successfully")
        return Response({"detail": "Password berhasil diubah!"})


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management (Admin only)"""
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role and role != 'ALL':
            qs = qs.filter(role=role)
        return qs
