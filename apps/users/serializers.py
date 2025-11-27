from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    nim = serializers.CharField(required=False, allow_blank=True)
    nip = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "name", "role", "is_active", "password", "nim", "nip"]
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        nim = validated_data.pop('nim', None)
        nip = validated_data.pop('nip', None)
        
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_password('password123')  # default password
        
        if nim:
            user.nim = nim
        if nip:
            user.nip = nip
            
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        nim = validated_data.pop('nim', None)
        nip = validated_data.pop('nip', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        if nim is not None:
            instance.nim = nim
        if nip is not None:
            instance.nip = nip
            
        instance.save()
        return instance
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add nim/nip from User model
        data['nim'] = getattr(instance, 'nim', None)
        data['nip'] = getattr(instance, 'nip', None)
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        if email and password:
            try:
                username = User.objects.get(email=email).username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials.")
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials.")
            if not user.is_active:
                raise serializers.ValidationError("User inactive.")
            attrs["user"] = user
            return attrs
        raise serializers.ValidationError("Email and password required.")
